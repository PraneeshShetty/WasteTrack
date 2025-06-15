<template>
  <div class="grid">
    <div class="col-12">
      <div class="card surface-card p-4 border-round-lg shadow-2">
        <div class="flex justify-content-between align-items-center mb-4">
          <h2 class="m-0 text-900">Reported Waste Disposals</h2>
          <div class="flex gap-3">
            <Button icon="pi pi-filter" label="Filter" severity="secondary" 
                    @click="toggleFilterPanel" />
            <Button icon="pi pi-refresh" label="Refresh" @click="loadDisposals" />
          </div>
        </div>

        <div class="grid">
          <div class="col-12 md:col-8">
            <div ref="mapContainer" class="map-container border-round-lg overflow-hidden shadow-2"></div>
          </div>
          <div class="col-12 md:col-4">
            <div class="surface-section border-round-lg p-4 h-full flex flex-column gap-3 shadow-1">
              <h3 class="mt-0">Recent Reports</h3>
              <DataTable :value="filteredDisposals" :paginator="true" :rows="5" 
                         scrollable scrollHeight="400px" class="h-full">
                <Column field="createdAt" header="Date" sortable>
                  <template #body="slotProps">
                    {{ formatDateTime(slotProps.data.createdAt) }}
                  </template>
                </Column>
                <Column field="wasteType" header="Type" sortable>
                  <template #body="slotProps">
                    <Tag :value="slotProps.data.wasteType" 
                         :severity="getWasteTypeSeverity(slotProps.data.wasteType)" />
                  </template>
                </Column>
                <Column header="Actions">
                  <template #body="slotProps">
                    <Button icon="pi pi-eye" class="p-button-rounded p-button-outlined p-button-info" 
                            @click="focusOnMarker(slotProps.data)" />
                  </template>
                </Column>
              </DataTable>
            </div>
          </div>
        </div>

        <Dialog v-model:visible="reportDialogVisible" modal :style="{width: '80vw'}" 
                header="Disposal Report Details" :breakpoints="{'960px': '75vw', '640px': '90vw'}">
          <div class="grid" v-if="selectedReport">
            <div class="col-12 md:col-6">
              <Galleria :value="selectedReport.images" :responsiveOptions="responsiveOptions" 
                        :numVisible="5" containerStyle="max-width: 100%">
                <template #item="slotProps">
                  <img :src="slotProps.item.url" :alt="slotProps.item.alt" 
                       class="w-full border-round" />
                </template>
                <template #thumbnail="slotProps">
                  <img :src="slotProps.item.url" :alt="slotProps.item.alt" 
                       class="w-full border-round" style="height: 60px; object-fit: cover;" />
                </template>
              </Galleria>
            </div>
            <div class="col-12 md:col-6">
              <div class="flex flex-column gap-3">
                <div>
                  <label class="font-medium block text-500 mb-1">Reported On</label>
                  <p>{{ formatDateTime(selectedReport.createdAt) }}</p>
                </div>
                <div>
                  <label class="font-medium block text-500 mb-1">Waste Type</label>
                  <Tag :value="selectedReport.wasteType" 
                       :severity="getWasteTypeSeverity(selectedReport.wasteType)" />
                </div>
                <div>
                  <label class="font-medium block text-500 mb-1">Location</label>
                  <p>{{ selectedReport.address || 'Address not available' }}</p>
                </div>
                <div>
                  <label class="font-medium block text-500 mb-1">Reported By</label>
                  <p>{{ selectedReport.reportedBy || 'Anonymous' }}</p>
                </div>
                <div v-if="selectedReport.notes">
                  <label class="font-medium block text-500 mb-1">Additional Notes</label>
                  <p class="whitespace-pre-line">{{ selectedReport.notes }}</p>
                </div>
                <div class="mt-3 flex justify-content-end gap-2">
                  <Button icon="pi pi-directions" label="View Location" 
                          @click="navigateToLocation(selectedReport)" />
                </div>
              </div>
            </div>
          </div>
        </Dialog>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "@/axios";
import { useToast } from "primevue/usetoast";

const toast = useToast();
const mapContainer = ref(null);
const disposals = ref([]);
const map = ref(null);
const markers = ref([]);
const reportDialogVisible = ref(false);
const selectedReport = ref(null);
const showFilters = ref(false);

const responsiveOptions = ref([
  {
    breakpoint: '1500px',
    numVisible: 5
  },
  {
    breakpoint: '1024px',
    numVisible: 3
  },
  {
    breakpoint: '768px',
    numVisible: 2
  },
  {
    breakpoint: '560px',
    numVisible: 1
  }
]);

// Initialize map
onMounted(() => {
  initializeMap();
  loadDisposals();
});

const initializeMap = () => {
  map.value = L.map(mapContainer.value, {
    center: [12.9141, 74.8560], // Default to Mangalore
    zoom: 12,
    zoomControl: false
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map.value);

  L.control.zoom({ position: 'topright' }).addTo(map.value);
};

const loadDisposals = async () => {
  try {
    const response = await axios.get('/api/inappropriate-disposals');
    disposals.value = response.data.map(d => ({
      ...d,
      createdAt: new Date(d.createdAt),
      images: d.images.map(img => ({
        url: img.url,
        alt: `Waste disposal at ${d.address}`
      }))
    }));
    updateMapMarkers();
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load disposal reports',
      life: 3000
    });
    console.error('Error loading disposals:', error);
  }
};

const updateMapMarkers = () => {
  // Clear existing markers
  markers.value.forEach(marker => marker.remove());
  markers.value = [];

  disposals.value.forEach(disposal => {
    const marker = L.marker([disposal.latitude, disposal.longitude], {
      icon: L.divIcon({
        className: `disposal-marker ${disposal.wasteType.toLowerCase()}`,
        html: `<i class="pi ${getWasteTypeIcon(disposal.wasteType)}"></i>`,
        iconSize: [30, 30]
      })
    })
      .addTo(map.value)
      .on('click', () => showReportDetails(disposal));
    
    markers.value.push(marker);
  });
};

const showReportDetails = (report) => {
  selectedReport.value = report;
  reportDialogVisible.value = true;
  map.value.flyTo([report.latitude, report.longitude], 15);
};

const focusOnMarker = (report) => {
  map.value.flyTo([report.latitude, report.longitude], 17);
  markers.value.find(m => 
    m.getLatLng().lat === report.latitude && 
    m.getLatLng().lng === report.longitude
  )?.openPopup();
};

const navigateToLocation = (report) => {
  const url = `https://www.google.com/maps?q=${report.latitude},${report.longitude}`;
  window.open(url, '_blank');
};

const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getWasteTypeSeverity = (type) => {
  const types = {
    PLASTIC: 'warning',
    ORGANIC: 'success',
    CONSTRUCTION: 'help',
    HAZARDOUS: 'danger',
    EWASTE: 'contrast',
    OTHER: 'info'
  };
  return types[type] || 'info';
};

const getWasteTypeIcon = (type) => {
  const icons = {
    PLASTIC: 'pi pi-recycle',
    ORGANIC: 'pi pi-leaf',
    CONSTRUCTION: 'pi pi-home',
    HAZARDOUS: 'pi pi-exclamation-triangle',
    EWASTE: 'pi pi-microchip',
    OTHER: 'pi pi-trash'
  };
  return icons[type] || 'pi pi-question-circle';
};

const toggleFilterPanel = () => {
  showFilters.value = !showFilters.value;
};

const filteredDisposals = computed(() => {
  return disposals.value; // Add filtering logic here if needed
});
</script>

<style scoped>
.map-container {
  height: 500px;
  width: 100%;
  border-radius: 12px;
  z-index: 1;
}

:deep(.disposal-marker) {
  display: flex;
  justify-content: center;
  align-items: center;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

:deep(.disposal-marker i) {
  color: white;
  font-size: 0.9rem;
}

:deep(.disposal-marker.plastic) { background-color: #F59E0B; }
:deep(.disposal-marker.organic) { background-color: #10B981; }
:deep(.disposal-marker.construction) { background-color: #8B5CF6; }
:deep(.disposal-marker.hazardous) { background-color: #F43F5E; }
:deep(.disposal-marker.ewaste) { background-color: #64748B; }
:deep(.disposal-marker.other) { background-color: #3B82F6; }
</style>