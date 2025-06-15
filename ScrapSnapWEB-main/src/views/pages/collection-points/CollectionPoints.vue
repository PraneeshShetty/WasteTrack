
<template>
  <div class="grid">
    <div class="col-12">
      <div class="card surface-card p-4 border-round-lg shadow-2">
        <div class="flex justify-content-between align-items-center mb-4">
          <h2 class="m-0 text-900">Waste Collection Points</h2>
          <div class="flex gap-3">
            <Button icon="pi pi-sync" label="Refresh" severity="secondary" @click="loadCollectionPoints" />
            <Button icon="pi pi-map-marker" label="My Location" @click="centerToUserLocation" />
          </div>
        </div>

        <div class="grid">
          <div class="col-12 md:col-8">
            <div ref="mapContainer" class="map-container border-round-lg overflow-hidden shadow-2"></div>
          </div>
          <div class="col-12 md:col-4">
            <div class="surface-section border-round-lg p-4 h-full flex flex-column gap-3 shadow-1">
              <div class="flex flex-column gap-2">
                <label for="wasteTypeFilter" class="font-medium">Filter by Waste Type</label>
                <MultiSelect v-model="selectedTypes" :options="garbageTypes" optionLabel="name" optionValue="code" 
                            placeholder="Select waste types" display="chip" class="w-full" />
              </div>
              
              <div class="flex flex-column gap-2">
                <label for="radiusFilter" class="font-medium">Search Radius</label>
                <Slider v-model="searchRadius" :min="1" :max="50" :step="1" class="w-full" />
                <div class="flex justify-content-between text-sm">
                  <span>1 km</span>
                  <span>{{ searchRadius }} km</span>
                  <span>50 km</span>
                </div>
              </div>

              <Divider />

              <div class="flex flex-column gap-3">
                <Button icon="pi pi-star" label="Nearest Facility" severity="help" @click="findNearestPoint" />
                <Button icon="pi pi-filter" label="Apply Filters" @click="applyFilters" />
              </div>
            </div>
          </div>
        </div>

        <DataTable :value="filteredPoints" :paginator="true" :rows="5" class="mt-5" stripedRows>
          <Column field="location" header="Location" sortable>
            <template #body="slotProps">
              <div class="flex align-items-center gap-2">
                <i class="pi pi-map-marker text-primary"></i>
                <span>{{ slotProps.data.location }}</span>
              </div>
            </template>
          </Column>
          <Column field="distance" header="Distance" sortable>
            <template #body="slotProps">
              <Tag :severity="getDistanceSeverity(slotProps.data.distance)">
                {{ formatDistance(slotProps.data.distance) }}
              </Tag>
            </template>
          </Column>
          <Column field="acceptsGargabeTypes" header="Accepts" style="min-width: 200px">
            <template #body="slotProps">
              <div class="flex flex-wrap gap-1">
                <Tag v-for="type in slotProps.data.acceptsGargabeTypes" 
                     :key="type" 
                     :value="getGarbageTypeName(type)" 
                     :severity="getGarbageTypeSeverity(type)" />
              </div>
            </template>
          </Column>
          <Column header="Actions">
            <template #body="slotProps">
              <Button icon="pi pi-directions" 
                      class="p-button-rounded p-button-outlined p-button-info" 
                      @click="navigateToPoint(slotProps.data)"
                      v-tooltip="'Get directions'" />
              <Button icon="pi pi-info-circle" 
                      class="p-button-rounded p-button-outlined p-button-secondary ml-2" 
                      @click="showPointDetails(slotProps.data)"
                      v-tooltip="'View details'" />
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </div>

  <Dialog v-model:visible="pointDetailsVisible" :style="{width: '450px'}" header="Collection Point Details" :modal="true">
    <div class="flex flex-column gap-3" v-if="selectedPoint">
      <div class="flex align-items-center gap-3">
        <i class="pi pi-map-marker text-primary text-2xl"></i>
        <span class="font-semibold text-lg">{{ selectedPoint.location }}</span>
      </div>
      
      <Divider />
      
      <div class="grid">
        <div class="col-6">
          <div class="text-sm text-500">Distance</div>
          <div class="font-medium">{{ formatDistance(selectedPoint.distance) }}</div>
        </div>
        <div class="col-6">
          <div class="text-sm text-500">Operating Hours</div>
          <div class="font-medium">{{ selectedPoint.operatingHours || '8:00 AM - 6:00 PM' }}</div>
        </div>
      </div>
      
      <div class="mt-2">
        <div class="text-sm text-500">Accepts</div>
        <div class="flex flex-wrap gap-1 mt-2">
          <Tag v-for="type in selectedPoint.acceptsGargabeTypes" 
               :key="type" 
               :value="getGarbageTypeName(type)" 
               :severity="getGarbageTypeSeverity(type)" />
        </div>
      </div>
      
      <Divider />
      
      <div v-if="selectedPoint.contact">
        <div class="text-sm text-500">Contact</div>
        <div class="font-medium">{{ selectedPoint.contact }}</div>
      </div>
      
      <div class="mt-3 flex justify-content-end gap-2">
        <Button icon="pi pi-directions" label="Get Directions" @click="navigateToPoint(selectedPoint)" />
      </div>
    </div>
  </Dialog>

  <Toast />
</template>

<script setup>
import { onMounted, ref, computed, watch } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "@/axios";
import { useToast } from "primevue/usetoast";

const toast = useToast();
const mapContainer = ref(null);
const collectionPoints = ref([]);
const selectedTypes = ref([]);
const userLocation = ref(null);
const map = ref(null);
const markers = ref([]);
const searchRadius = ref(10);
const pointDetailsVisible = ref(false);
const selectedPoint = ref(null);

// Constants
const MANGALORE_CENTER = {
  lat: 12.9141,
  lng: 74.8560
};

const garbageTypes = [
  { name: 'Paper', code: 'PAPER', color: 'info' },
  { name: 'Plastic', code: 'PLASTIC', color: 'warning' },
  { name: 'Glass', code: 'GLASS', color: 'help' },
  { name: 'Metal', code: 'METAL', color: 'danger' },
  { name: 'Organic', code: 'ORGANIC', color: 'success' },
  { name: 'E-Waste', code: 'EWASTE', color: 'contrast' },
  { name: 'Hazardous', code: 'HAZARDOUS', color: 'danger' }
];

// Initialize map with 3D-like terrain
onMounted(async () => {
  initializeMap();
  await getUserLocation();
  await loadCollectionPoints();
});

const initializeMap = () => {
  map.value = L.map(mapContainer.value, {
    center: [MANGALORE_CENTER.lat, MANGALORE_CENTER.lng],
    zoom: 12,
    zoomControl: false,
    preferCanvas: true
  });

  // Add terrain-like tile layer
  L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    maxZoom: 17,
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  }).addTo(map.value);

  // Add custom zoom controls
  L.control.zoom({
    position: 'topright'
  }).addTo(map.value);
};

const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      showError('Geolocation is not supported by your browser');
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLocation.value = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        // Add user marker with pulse effect
        const userMarker = L.marker([userLocation.value.lat, userLocation.value.lng], {
          icon: L.divIcon({
            className: 'user-location-marker-3d',
            html: '<div class="pulse-dot"></div><i class="pi pi-user user-location-icon"></i>',
            iconSize: [30, 30]
          }),
          zIndexOffset: 1000
        }).addTo(map.value)
          .bindPopup('<div class="font-bold">Your Location</div>')
          .openPopup();
        
        markers.value.push(userMarker);
        resolve(position);
      },
      (error) => {
        showError('Unable to get your location. Using Mangalore center instead.');
        userLocation.value = MANGALORE_CENTER;
        resolve(MANGALORE_CENTER);
      }
    );
  });
};

const loadCollectionPoints = async () => {
  try {
    const response = await axios.get('/collection-points', {
      params: {
        lat: userLocation.value.lat,
        lng: userLocation.value.lng,
        radius: searchRadius.value
      }
    });
    
    collectionPoints.value = response.data.map(point => ({
      ...point,
      distance: calculateDistance(
        userLocation.value.lat,
        userLocation.value.lng,
        point.latitude,
        point.longitude
      )
    }));
    
    updateMapMarkers();
    
  } catch (error) {
    showError('Failed to load collection points. Using sample data.');
    // Fallback to sample data for demo
    collectionPoints.value = getSampleData().map(point => ({
      ...point,
      distance: calculateDistance(
        userLocation.value.lat,
        userLocation.value.lng,
        point.latitude,
        point.longitude
      )
    }));
    updateMapMarkers();
  }
};

const getSampleData = () => {
  return [
    {
      id: 1,
      location: "Mangalore City Corporation Waste Center",
      latitude: 12.8995,
      longitude: 74.8363,
      acceptsGargabeTypes: ["PAPER", "PLASTIC", "GLASS", "METAL"],
      operatingHours: "7:00 AM - 7:00 PM",
      contact: "0824-2456789"
    },
    {
      id: 2,
      location: "Kadri Park Recycling Point",
      latitude: 12.8743,
      longitude: 74.8432,
      acceptsGargabeTypes: ["PAPER", "PLASTIC", "ORGANIC"],
      operatingHours: "8:00 AM - 6:00 PM"
    },
    {
      id: 3,
      location: "Surathkal E-Waste Facility",
      latitude: 12.9948,
      longitude: 74.7936,
      acceptsGargabeTypes: ["EWASTE", "METAL"],
      contact: "0824-2468123"
    },
    {
      id: 4,
      location: "Pumpwell Organic Waste Center",
      latitude: 12.9156,
      longitude: 74.8804,
      acceptsGargabeTypes: ["ORGANIC"],
      operatingHours: "6:00 AM - 8:00 PM"
    },
    {
      id: 5,
      location: "Ullal Hazardous Waste Facility",
      latitude: 12.8049,
      longitude: 74.8603,
      acceptsGargabeTypes: ["HAZARDOUS", "EWASTE"],
      contact: "0824-2455555"
    }
  ];
};

const updateMapMarkers = () => {
  // Clear existing markers (except user marker)
  markers.value.slice(1).forEach(marker => marker.remove());
  markers.value = markers.value.slice(0, 1);
  
  // Add markers for collection points
  collectionPoints.value.forEach(point => {
    const marker = L.marker([point.latitude, point.longitude], {
      icon: L.divIcon({
        className: `collection-point-marker-3d ${point.acceptsGargabeTypes[0].toLowerCase()}`,
        html: `<i class="pi ${getGarbageTypeIcon(point.acceptsGargabeTypes[0])}"></i>`,
        iconSize: [30, 30]
      }),
      riseOnHover: true
    })
      .bindPopup(createPopupContent(point))
      .addTo(map.value);
    
    markers.value.push(marker);
  });
};

const createPopupContent = (point) => {
  return `
    <div class="p-3" style="min-width: 200px">
      <div class="flex align-items-center gap-2 mb-2">
        <i class="pi ${getGarbageTypeIcon(point.acceptsGargabeTypes[0])} text-lg"></i>
        <span class="font-bold">${point.location}</span>
      </div>
      <div class="mb-2">
        <span class="text-sm">Distance: </span>
        <span class="font-semibold">${formatDistance(point.distance)}</span>
      </div>
      <div class="mb-2">
        <span class="text-sm">Accepts: </span>
        <div class="flex flex-wrap gap-1 mt-1">
          ${point.acceptsGargabeTypes.map(type => 
            `<span class="inline-flex align-items-center py-1 px-2 border-round-sm text-xs" 
                   style="background: ${getGarbageTypeColor(type, true)}; color: white">
              ${getGarbageTypeName(type)}
            </span>`
          ).join('')}
        </div>
      </div>
      <button onclick="event.stopPropagation(); window.dispatchEvent(new CustomEvent('show-point-details', { detail: ${point.id} }));" 
              class="w-full p-2 border-none bg-blue-500 hover:bg-blue-600 text-white border-round-sm text-sm mt-2">
        View Details
      </button>
    </div>
  `;
};

// Add event listener for custom event from popup
onMounted(() => {
  window.addEventListener('show-point-details', (e) => {
    const point = collectionPoints.value.find(p => p.id === e.detail);
    if (point) showPointDetails(point);
  });
});

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const toRad = (value) => value * Math.PI / 180;

const formatDistance = (distance) => {
  if (distance < 1) return `${Math.round(distance * 1000)} meters`;
  return `${distance.toFixed(1)} km`;
};

const findNearestPoint = () => {
  if (!userLocation.value) {
    showWarning('Please enable location services to find nearest point');
    return;
  }

  if (filteredPoints.value.length === 0) {
    showInfo('No collection points match your filters');
    return;
  }

  const nearest = filteredPoints.value.reduce((prev, curr) => 
    prev.distance < curr.distance ? prev : curr
  );

  // Fly to the nearest point with animation
  map.value.flyTo([nearest.latitude, nearest.longitude], 15, {
    duration: 1,
    easeLinearity: 0.25
  });

  // Highlight the nearest point
  markers.value.find(marker => 
    marker.getLatLng().lat === nearest.latitude && 
    marker.getLatLng().lng === nearest.longitude
  )?.openPopup();
};

const centerToUserLocation = () => {
  if (userLocation.value) {
    map.value.flyTo([userLocation.value.lat, userLocation.value.lng], 15);
  } else {
    showWarning('Location not available');
  }
};

const navigateToPoint = (point) => {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${point.latitude},${point.longitude}`;
  window.open(url, '_blank');
};

const showPointDetails = (point) => {
  selectedPoint.value = point;
  pointDetailsVisible.value = true;
};

const applyFilters = () => {
  loadCollectionPoints();
};

// Helper functions for garbage types
const getGarbageTypeName = (code) => {
  return garbageTypes.find(t => t.code === code)?.name || code;
};

const getGarbageTypeSeverity = (code) => {
  return garbageTypes.find(t => t.code === code)?.color || 'info';
};

const getGarbageTypeColor = (code, lighten = false) => {
  const colors = {
    PAPER: lighten ? '#3B82F6' : '#2563EB',
    PLASTIC: lighten ? '#F59E0B' : '#D97706',
    GLASS: lighten ? '#8B5CF6' : '#7C3AED',
    METAL: lighten ? '#EF4444' : '#DC2626',
    ORGANIC: lighten ? '#10B981' : '#059669',
    EWASTE: lighten ? '#64748B' : '#475569',
    HAZARDOUS: lighten ? '#F43F5E' : '#E11D48'
  };
  return colors[code] || '#3B82F6';
};

const getGarbageTypeIcon = (code) => {
  const icons = {
    PAPER: 'pi pi-file',
    PLASTIC: 'pi pi-recycle',
    GLASS: 'pi pi-bottle',
    METAL: 'pi pi-box',
    ORGANIC: 'pi pi-leaf',
    EWASTE: 'pi pi-microchip',
    HAZARDOUS: 'pi pi-exclamation-triangle'
  };
  return icons[code] || 'pi pi-trash';
};

const getDistanceSeverity = (distance) => {
  if (distance < 1) return 'success';
  if (distance < 3) return 'info';
  if (distance < 10) return 'warning';
  return 'danger';
};

// Toast helpers
const showError = (message) => {
  toast.add({ severity: 'error', summary: 'Error', detail: message, life: 3000 });
};

const showWarning = (message) => {
  toast.add({ severity: 'warn', summary: 'Warning', detail: message, life: 3000 });
};

const showInfo = (message) => {
  toast.add({ severity: 'info', summary: 'Info', detail: message, life: 3000 });
};

// Watch for radius changes
watch(searchRadius, (newVal) => {
  if (newVal > 0) {
    loadCollectionPoints();
  }
});
</script>

<style scoped>
.map-container {
  height: 500px;
  width: 100%;
  border-radius: 12px;
  z-index: 1;
}

:deep(.user-location-marker-3d) {
  position: relative;
}

:deep(.user-location-icon) {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 0.8rem;
}

.pulse-dot {
  width: 100%;
  height: 100%;
  background-color: #3B82F6;
  border-radius: 50%;
  box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
  }
}

:deep(.collection-point-marker-3d) {
  display: flex;
  justify-content: center;
  align-items: center;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

:deep(.collection-point-marker-3d i) {
  color: white;
  font-size: 0.9rem;
}

:deep(.collection-point-marker-3d.paper) { background-color: #3B82F6; }
:deep(.collection-point-marker-3d.plastic) { background-color: #F59E0B; }
:deep(.collection-point-marker-3d.glass) { background-color: #8B5CF6; }
:deep(.collection-point-marker-3d.metal) { background-color: #EF4444; }
:deep(.collection-point-marker-3d.organic) { background-color: #10B981; }
:deep(.collection-point-marker-3d.ewaste) { background-color: #64748B; }
:deep(.collection-point-marker-3d.hazardous) { background-color: #F43F5E; }

:deep(.leaflet-popup-content-wrapper) {
  border-radius: 8px;
}

:deep(.leaflet-popup-content) {
  margin: 0;
}
</style>