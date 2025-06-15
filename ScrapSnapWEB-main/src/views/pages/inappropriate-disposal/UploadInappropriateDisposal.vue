<template>
  <div class="grid">
    <div class="col-12">
      <div class="card surface-card p-4 border-round-lg shadow-2">
        <h2 class="mt-0 mb-4">Report Inappropriate Disposal</h2>
        
        <div class="grid">
          <div class="col-12 md:col-6">
            <div class="surface-section border-round-lg p-4 h-full flex flex-column gap-4">
              <!-- Waste Type Selection -->
              <div>
                <label class="font-medium block mb-2">Waste Type*</label>
                <Dropdown v-model="selectedWasteType" :options="wasteTypes" optionLabel="name" 
                          placeholder="Select waste type" class="w-full" :class="{'p-invalid': !selectedWasteType && formSubmitted}" />
                <small v-if="!selectedWasteType && formSubmitted" class="p-error">Waste type is required</small>
              </div>
              
              <!-- File Upload -->
              <div>
                <label class="font-medium block mb-2">Upload Photos*</label>
                <FileUpload 
                  name="disposalPhotos"
                  :url="uploadUrl"
                  :headers="uploadHeaders"
                  mode="advanced"
                  :multiple="true"
                  accept="image/*"
                  :maxFileSize="5000000"
                  :customUpload="true"
                  @uploader="onFileSelect"
                  @remove="onFileRemove"
                  chooseLabel="Browse"
                  :class="{'p-invalid': !uploadedFiles.length && formSubmitted}"
                >
                  <template #empty>
                    <div class="flex flex-column align-items-center justify-content-center p-4 border-2 border-dashed border-round surface-border">
                      <i class="pi pi-cloud-upload text-4xl text-400 mb-2"></i>
                      <p class="m-0 text-600">Drag & drop photos here or click to browse</p>
                      <small class="text-500 mt-2">Accepted formats: JPEG, PNG, GIF</small>
                      <small class="text-500">Maximum size: 5MB per file, 10MB total</small>
                    </div>
                  </template>
                  <template #content="{ files, uploadedFiles, removeUploadedFile, removeFile }">
                    <div class="flex flex-wrap gap-3">
                      <!-- Preview uploaded files -->
                      <div v-for="file in files" :key="file.name" class="relative">
                        <img :src="file.objectURL" class="w-8rem h-8rem border-round" />
                        <Button icon="pi pi-times" class="p-button-rounded p-button-danger p-button-text absolute top-0 right-0"
                                @click="removeFile(file)" />
                      </div>
                    </div>
                  </template>
                </FileUpload>
                <div class="mt-2">
                  <small class="text-500">File types supported: PNG, JPEG, GIF</small>
                  <small class="text-500 block">Size limits: 5MB per file, 10MB total</small>
                </div>
                <small v-if="!uploadedFiles.length && formSubmitted" class="p-error block mt-2">
                  At least one photo is required
                </small>
              </div>
              
              <!-- Additional Notes -->
              <div>
                <label for="notes" class="font-medium block mb-2">Additional Notes</label>
                <Textarea id="notes" v-model="notes" rows="3" class="w-full" 
                          placeholder="Provide any additional details about this disposal..." 
                          aria-label="Additional notes about the disposal" />
              </div>
            </div>
          </div>
          
          <!-- Location Section -->
          <div class="col-12 md:col-6">
            <div class="surface-section border-round-lg p-4 h-full flex flex-column gap-3">
              <h3 class="mt-0">Location Details</h3>
              
              <!-- Location Search -->
              <div class="mb-3">
                <label for="locationSearch" class="font-medium block mb-2">Search Location*</label>
                <div class="p-inputgroup">
                  <InputText id="locationSearch" v-model="locationSearch" 
                             placeholder="Search for a location..." 
                             aria-label="Search location"
                             @keyup.enter="searchLocation" />
                  <Button icon="pi pi-search" @click="searchLocation" 
                          aria-label="Search for location" />
                </div>
              </div>
              
              <div ref="mapContainer" class="map-container border-round overflow-hidden" 
                   @click="handleMapClick"></div>
              
              <!-- Location Coordinates -->
              <div class="mt-3">
                <fieldset>
                  <legend class="font-medium block mb-2">Selected Location Coordinates</legend>
                  <div class="grid">
                    <div class="col-6">
                      <InputNumber v-model="selectedLat" placeholder="Latitude" 
                                  mode="decimal" :min="-90" :max="90" :step="0.000001" 
                                  class="w-full" :disabled="true"
                                  aria-label="Latitude" />
                    </div>
                    <div class="col-6">
                      <InputNumber v-model="selectedLng" placeholder="Longitude" 
                                  mode="decimal" :min="-180" :max="180" :step="0.000001" 
                                  class="w-full" :disabled="true"
                                  aria-label="Longitude" />
                    </div>
                  </div>
                  <div class="mt-2">
                    <InputText v-model="selectedAddress" placeholder="Address will appear here" 
                              class="w-full" :disabled="true"
                              aria-label="Selected location address" />
                  </div>
                </fieldset>
              </div>
            </div>
          </div>
        </div>
        
        <Divider />
        
        <div class="flex justify-content-end gap-2">
          <Button label="Cancel" severity="secondary" @click="resetForm" />
          <Button label="Submit Report" @click="submitReport" :loading="submitting" 
                  icon="pi pi-send" :disabled="!isFormComplete" />
        </div>
      </div>
    </div>
  </div>
  
  <Toast />
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from 'vue-router';
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "@/axios";
import { useToast } from "primevue/usetoast";

const toast = useToast();
const router = useRouter();
const mapContainer = ref(null);
const map = ref(null);
const marker = ref(null);

// Form data
const selectedWasteType = ref(null);
const uploadedFiles = ref([]);
const notes = ref('');
const formSubmitted = ref(false);
const submitting = ref(false);

// Custom file upload URL and handlers
const uploadUrl = computed(() => `${import.meta.env.VITE_API_BASE_URL}/inappropriate-disposals/upload-temp`);
const uploadHeaders = computed(() => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`
}));

// Location data
const locationSearch = ref('');
const selectedLat = ref(null);
const selectedLng = ref(null);
const selectedAddress = ref('');

const wasteTypes = [
  { name: 'Plastic', code: 'PLASTIC' },
  { name: 'Organic', code: 'ORGANIC' },
  { name: 'Construction', code: 'CONSTRUCTION' },
  { name: 'Hazardous', code: 'HAZARDOUS' },
  { name: 'E-Waste', code: 'EWASTE' },
  { name: 'Other', code: 'OTHER' }
];

// Initialize map
onMounted(() => {
  initializeMap();
});

const initializeMap = () => {
  map.value = L.map(mapContainer.value, {
    center: [12.9141, 74.8560], // Default to Mangalore
    zoom: 13,
    zoomControl: false
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map.value);

  // Add click event to map
  map.value.on('click', handleMapClick);
};

const handleMapClick = async (e) => {
  if (!e || !e.latlng) return;
  selectedLat.value = e.latlng.lat;
  selectedLng.value = e.latlng.lng;
  
  updateMarker(selectedLat.value, selectedLng.value);
  
  // Get address for clicked location
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${selectedLat.value}&lon=${selectedLng.value}`
    );
    selectedAddress.value = response.data.display_name || 'Selected location';
  } catch (error) {
    console.error('Error getting address:', error);
    selectedAddress.value = 'Selected location';
  }
};

const updateMarker = (lat, lng) => {
  if (marker.value) {
    marker.value.setLatLng([lat, lng]);
  } else {
    marker.value = L.marker([lat, lng], {
      icon: L.divIcon({
        className: 'location-marker',
        html: '<div class="pulse-dot"></div><i class="pi pi-map-marker"></i>',
        iconSize: [30, 30]
      })
    }).addTo(map.value);
  }
};

const searchLocation = async () => {
  if (!locationSearch.value.trim()) return;
  
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationSearch.value)}`
    );
    
    if (response.data && response.data.length > 0) {
      const firstResult = response.data[0];
      selectedLat.value = parseFloat(firstResult.lat);
      selectedLng.value = parseFloat(firstResult.lon);
      selectedAddress.value = firstResult.display_name;
      
      // Update map view and marker
      map.value.setView([selectedLat.value, selectedLng.value], 15);
      updateMarker(selectedLat.value, selectedLng.value);
    } else {
      toast.add({
        severity: 'warn',
        summary: 'No Results',
        detail: 'No locations found for your search',
        life: 3000
      });
    }
  } catch (error) {
    console.error('Error searching location:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to search location',
      life: 3000
    });
  }
};

const onFileSelect = async (event) => {
  const maxFileSize = 5 * 1024 * 1024; // 5MB
  const totalSize = event.files.reduce((sum, file) => sum + file.size, 0);
  const currentTotalSize = uploadedFiles.value.reduce((sum, file) => sum + file.size, 0);

  if (totalSize + currentTotalSize > 10 * 1024 * 1024) { // 10MB total limit
    toast.add({
      severity: 'error',
      summary: 'File Size Error',
      detail: 'Total file size exceeds 10MB limit',
      life: 3000
    });
    return;
  }

  for (const file of event.files) {
    if (file.size > maxFileSize) {
      toast.add({
        severity: 'error',
        summary: 'File Size Error',
        detail: `File ${file.name} exceeds 5MB limit`,
        life: 3000
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.add({
        severity: 'error',
        summary: 'Invalid File',
        detail: `${file.name} is not an image file`,
        life: 3000
      });
      return;
    }
  }

  uploadedFiles.value = [...uploadedFiles.value, ...event.files];
};

const onFileRemove = (event) => {
  uploadedFiles.value = uploadedFiles.value.filter(file => file.name !== event.file.name);
};

const isFormComplete = computed(() => {
  return selectedWasteType.value && 
         uploadedFiles.value.length > 0 && 
         selectedLat.value && 
         selectedLng.value;
});

const validateForm = () => {
  formSubmitted.value = true;
  return isFormComplete.value;
};

const submitReport = async () => {
  if (!validateForm()) {
    toast.add({
      severity: 'error',
      summary: 'Validation Error',
      detail: 'Please fill all required fields',
      life: 3000
    });
    return;
  }

  submitting.value = true;
  
  try {
    // Validate token first
    const token = localStorage.getItem('token');
    if (!token) {
      toast.add({
        severity: 'error',
        summary: 'Authentication Error',
        detail: 'Please login to submit a report',
        life: 3000
      });
      router.push('/auth/login');
      return;
    }

    // Create form data
    const formData = new FormData();
    
    formData.append('wasteType', selectedWasteType.value.code);
    formData.append('latitude', selectedLat.value.toString());
    formData.append('longitude', selectedLng.value.toString());
    formData.append('address', selectedAddress.value || '');
    formData.append('notes', notes.value || '');
    
    // Add files
    for (const file of uploadedFiles.value) {
      formData.append('images', file);
    }

    // API call with retry logic
    const maxRetries = 3;
    let retryCount = 0;
    let success = false;

    while (!success && retryCount < maxRetries) {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/inappropriate-disposals`, 
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            },
            timeout: 30000, // 30 second timeout
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              // You could add a progress indicator here if needed
            }
          }
        );
        
        success = true;
        toast.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Report submitted successfully!',
          life: 3000
        });
        
        resetForm();
      } catch (error) {
        retryCount++;
        if (retryCount === maxRetries) {
          throw error; // Throw after all retries fail
        }
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
      }
    }
  } catch (error) {
    console.error('Error submitting report:', error);
    
    let errorMessage = 'Failed to submit report. Please try again.';
    
    if (error.response) {
      switch (error.response.status) {
        case 401:
          errorMessage = 'Your session has expired. Please login again.';
          router.push('/auth/login');
          break;
        case 413:
          errorMessage = 'Files are too large. Maximum total size is 10MB.';
          break;
        case 415:
          errorMessage = 'Invalid file type. Only images are allowed.';
          break;
        case 429:
          errorMessage = 'Too many requests. Please wait a moment and try again.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        default:
          errorMessage = error.response.data?.message || 'An unexpected error occurred.';
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: errorMessage,
      life: 5000
    });
  } finally {
    submitting.value = false;
  }
};

const resetForm = () => {
  selectedWasteType.value = null;
  uploadedFiles.value = [];
  notes.value = '';
  locationSearch.value = '';
  selectedLat.value = null;
  selectedLng.value = null;
  selectedAddress.value = '';
  formSubmitted.value = false;
  
  // Reset map view
  map.value.setView([12.9141, 74.8560], 13);
  if (marker.value) {
    map.value.removeLayer(marker.value);
    marker.value = null;
  }
};
</script>

<style scoped>
.map-container {
  height: 300px;
  width: 100%;
  cursor: pointer;
}

:deep(.location-marker) {
  position: relative;
}

:deep(.location-marker .pi) {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 0.8rem;
}

fieldset {
  border: none;
  padding: 0;
  margin: 0;
}

legend {
  padding: 0;
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
</style>