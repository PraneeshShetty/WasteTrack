<template>
    <div class="grid">
        <!-- Statistics Cards -->
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0 overview-box success">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Collections Today</span>
                        <div class="text-900 font-medium text-xl">152</div>
                    </div>
                    <div class="flex items-center justify-center bg-green-100 rounded-xl w-3rem h-3rem">
                        <i class="pi pi-shopping-cart text-green-500 text-xl"></i>
                    </div>
                </div>
                <span class="text-green-500 font-medium">24 new </span>
                <span class="text-500">since last visit</span>
            </div>
        </div>
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0 overview-box warning">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Pending Pickups</span>
                        <div class="text-900 font-medium text-xl">28</div>
                    </div>
                    <div class="flex items-center justify-center bg-orange-100 rounded-xl w-3rem h-3rem">
                        <i class="pi pi-map-marker text-orange-500 text-xl"></i>
                    </div>
                </div>
                <span class="text-orange-500 font-medium">%12+ </span>
                <span class="text-500">from yesterday</span>
            </div>
        </div>
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0 overview-box danger">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Reported Issues</span>
                        <div class="text-900 font-medium text-xl">15</div>
                    </div>
                    <div class="flex items-center justify-center bg-red-100 rounded-xl w-3rem h-3rem">
                        <i class="pi pi-exclamation-circle text-red-500 text-xl"></i>
                    </div>
                </div>
                <span class="text-red-500 font-medium">5 critical </span>
                <span class="text-500">require attention</span>
            </div>
        </div>
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0 overview-box info">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Collection Points</span>
                        <div class="text-900 font-medium text-xl">72</div>
                    </div>
                    <div class="flex items-center justify-center bg-blue-100 rounded-xl w-3rem h-3rem">
                        <i class="pi pi-inbox text-blue-500 text-xl"></i>
                    </div>
                </div>
                <span class="text-blue-500 font-medium">4 new </span>
                <span class="text-500">since last week</span>
            </div>
        </div>

        <!-- Collection Statistics Chart -->
        <div class="col-12 xl:col-8">
            <div class="card">
                <h5>Collection Statistics</h5>
                <Chart type="line" :data="lineData" :options="lineOptions" class="h-20rem" />
            </div>
        </div>

        <!-- Activity Timeline -->
        <div class="col-12 xl:col-4">
            <div class="card">
                <h5>Recent Activity</h5>
                <div class="flex flex-column gap-3">
                    <div v-for="(activity, i) in recentActivities" :key="i" 
                         class="activity-item p-3 border-round-lg surface-ground">
                        <div class="flex align-items-start">
                            <div :class="activity.iconClass + ' mr-3 p-2 border-round-xl'">
                                <i :class="activity.icon + ' text-xl'"></i>
                            </div>
                            <div class="flex-1">
                                <h6 class="m-0 mb-1">{{ activity.title }}</h6>
                                <p class="text-600 m-0">{{ activity.description }}</p>
                                <span class="text-sm text-500">{{ activity.time }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Reports Table -->
        <div class="col-12">
            <div class="card">
                <DataTable :value="reportedIssues" :paginator="true" :rows="5" 
                          responsiveLayout="scroll" class="p-datatable-sm">
                    <Column field="id" header="ID" style="width: 5%"></Column>
                    <Column field="location" header="Location" style="width: 20%">
                        <template #body="slotProps">
                            <div class="flex align-items-center gap-2">
                                <i class="pi pi-map-marker text-500"></i>
                                <span>{{ slotProps.data.location }}</span>
                            </div>
                        </template>
                    </Column>
                    <Column field="type" header="Type" style="width: 15%">
                        <template #body="slotProps">
                            <Tag :value="slotProps.data.type" :severity="getTypeSeverity(slotProps.data.type)" />
                        </template>
                    </Column>
                    <Column field="reporter" header="Reporter" style="width: 20%">
                        <template #body="slotProps">
                            <div class="flex align-items-center gap-2">
                                <i class="pi pi-user text-500"></i>
                                <span>{{ slotProps.data.reporter }}</span>
                            </div>
                        </template>
                    </Column>
                    <Column field="status" header="Status" style="width: 15%">
                        <template #body="slotProps">
                            <Tag :value="slotProps.data.status" :severity="getStatusSeverity(slotProps.data.status)" />
                        </template>
                    </Column>
                    <Column field="date" header="Date" style="width: 15%"></Column>
                    <Column header="Actions" style="width: 10%">
                        <template #body>
                            <div class="flex gap-2">
                                <Button icon="pi pi-eye" class="p-button-rounded p-button-text" />
                                <Button icon="pi pi-pencil" class="p-button-rounded p-button-text p-button-warning" />
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Chart from 'primevue/chart';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import Button from 'primevue/button';

// Chart Data
const lineData = ref({
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    datasets: [
        {
            label: 'Collections',
            data: [65, 59, 80, 81, 56, 55],
            fill: false,
            borderColor: '#4CAF50',
            tension: 0.4
        },
        {
            label: 'Issues',
            data: [28, 48, 40, 19, 86, 27],
            fill: false,
            borderColor: '#FFA726',
            tension: 0.4
        }
    ]
});

const lineOptions = ref({
    plugins: {
        legend: {
            labels: {
                color: '#495057'
            }
        }
    },
    scales: {
        x: {
            ticks: {
                color: '#495057'
            },
            grid: {
                color: '#ebedef'
            }
        },
        y: {
            ticks: {
                color: '#495057'
            },
            grid: {
                color: '#ebedef'
            }
        }
    }
});

// Recent Activities
const recentActivities = ref([
    {
        title: 'New Collection Point Added',
        description: 'Green Park Avenue, Block 5',
        time: '2 hours ago',
        icon: 'pi pi-plus',
        iconClass: 'bg-green-100 text-green-500'
    },
    {
        title: 'Collection Completed',
        description: 'Central Market Area',
        time: '4 hours ago',
        icon: 'pi pi-check',
        iconClass: 'bg-blue-100 text-blue-500'
    },
    {
        title: 'Issue Reported',
        description: 'Overflow at Downtown Station',
        time: '1 day ago',
        icon: 'pi pi-exclamation-triangle',
        iconClass: 'bg-orange-100 text-orange-500'
    }
]);

// Reported Issues Data
const reportedIssues = ref([
    {
        id: '001',
        location: 'Downtown Market',
        type: 'Overflow',
        reporter: 'John Doe',
        status: 'Critical',
        date: '2025-06-15'
    },
    {
        id: '002',
        location: 'City Park',
        type: 'Illegal Dumping',
        reporter: 'Jane Smith',
        status: 'Pending',
        date: '2025-06-14'
    },
    {
        id: '003',
        location: 'Beach Road',
        type: 'Collection Delay',
        reporter: 'Mike Johnson',
        status: 'Resolved',
        date: '2025-06-13'
    }
]);

const getTypeSeverity = (type) => {
    switch (type) {
        case 'Overflow':
            return 'danger';
        case 'Illegal Dumping':
            return 'warning';
        case 'Collection Delay':
            return 'info';
        default:
            return null;
    }
};

const getStatusSeverity = (status) => {
    switch (status) {
        case 'Critical':
            return 'danger';
        case 'Pending':
            return 'warning';
        case 'Resolved':
            return 'success';
        default:
            return null;
    }
};
</script>

<style lang="scss" scoped>
.overview-box {
    position: relative;
    overflow: hidden;
    
    &::after {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        width: 100px;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1));
        transform: skewX(-15deg) translateX(100%);
        transition: transform 0.5s ease;
    }
    
    &:hover::after {
        transform: skewX(-15deg) translateX(-50%);
    }
    
    &.success { background: linear-gradient(45deg, var(--green-50), var(--green-100)); }
    &.warning { background: linear-gradient(45deg, var(--orange-50), var(--orange-100)); }
    &.danger { background: linear-gradient(45deg, var(--red-50), var(--red-100)); }
    &.info { background: linear-gradient(45deg, var(--blue-50), var(--blue-100)); }
}

.activity-item {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
}

// Dark theme support
:deep([data-pc-theme="dark"]) {
    .overview-box {
        &.success { background: linear-gradient(45deg, rgba(76,175,80,0.2), rgba(76,175,80,0.1)); }
        &.warning { background: linear-gradient(45deg, rgba(255,167,38,0.2), rgba(255,167,38,0.1)); }
        &.danger { background: linear-gradient(45deg, rgba(244,67,54,0.2), rgba(244,67,54,0.1)); }
        &.info { background: linear-gradient(45deg, rgba(33,150,243,0.2), rgba(33,150,243,0.1)); }
    }
    
    .activity-item {
        background: rgba(30,30,30,0.5);
    }
}
</style>
