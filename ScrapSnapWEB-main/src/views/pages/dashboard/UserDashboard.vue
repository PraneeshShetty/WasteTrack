//Copy existing content from Dashboard.vue and rename component
<template>
    <div class="grid">
        <!-- Featured Article -->
        <div class="col-12">
            <div class="card surface-card p-4 shadow-2 border-round-xl featured-article">
                <div class="flex flex-column md:flex-row gap-4">
                    <div class="relative w-full md:w-6 overflow-hidden border-round-xl">                        <div class="w-full h-20rem border-round-xl relative overflow-hidden">
                            <div class="absolute inset-0 bg-primary-100 flex align-items-center justify-content-center">
                                <i class="pi pi-image text-4xl text-primary-500"></i>
                            </div>
                        </div>
                    </div>
                    <div class="flex-1 flex flex-column gap-3">
                        <span class="bg-primary-100 text-primary-900 px-2 py-1 border-round text-sm font-medium inline-flex self-start">Featured</span>
                        <h2 class="text-900 font-bold text-4xl mt-0 mb-2">Mangalore's Green Initiative: Making Our City Cleaner</h2>
                        <p class="text-700 line-height-3 m-0">
                            Discover how Mangalore is transforming its waste management through community participation and modern technology.
                            Learn about the latest initiatives and how you can contribute to keeping our city clean.
                        </p>
                        <Button label="Read More" icon="pi pi-arrow-right" class="p-button-rounded p-button-outlined align-self-start mt-3" />
                    </div>
                </div>
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="col-12">
            <div class="grid">
                <div class="col-12 md:col-6 lg:col-3">
                    <div class="card p-3 border-round-xl hover:shadow-3 cursor-pointer transition-colors transition-duration-300"
                         style="background: linear-gradient(45deg, var(--green-100), var(--green-50))">
                        <div class="flex align-items-center gap-3">
                            <div class="flex align-items-center justify-content-center bg-green-500 border-round-xl w-3rem h-3rem">
                                <i class="pi pi-map-marker text-white text-2xl"></i>
                            </div>
                            <div>
                                <span class="block font-medium text-900 mb-1">Find Collection Points</span>
                                <span class="text-600">Locate nearby waste collection centers</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-12 md:col-6 lg:col-3">
                    <div class="card p-3 border-round-xl hover:shadow-3 cursor-pointer transition-colors transition-duration-300"
                         style="background: linear-gradient(45deg, var(--blue-100), var(--blue-50))">
                        <div class="flex align-items-center gap-3">
                            <div class="flex align-items-center justify-content-center bg-blue-500 border-round-xl w-3rem h-3rem">
                                <i class="pi pi-calendar text-white text-2xl"></i>
                            </div>
                            <div>
                                <span class="block font-medium text-900 mb-1">Schedule Pickup</span>
                                <span class="text-600">Book a waste collection service</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-12 md:col-6 lg:col-3">
                    <div class="card p-3 border-round-xl hover:shadow-3 cursor-pointer transition-colors transition-duration-300"
                         style="background: linear-gradient(45deg, var(--orange-100), var(--orange-50))">
                        <div class="flex align-items-center gap-3">
                            <div class="flex align-items-center justify-content-center bg-orange-500 border-round-xl w-3rem h-3rem">
                                <i class="pi pi-camera text-white text-2xl"></i>
                            </div>
                            <div>
                                <span class="block font-medium text-900 mb-1">Report Issue</span>
                                <span class="text-600">Report improper waste disposal</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-12 md:col-6 lg:col-3">
                    <div class="card p-3 border-round-xl hover:shadow-3 cursor-pointer transition-colors transition-duration-300"
                         style="background: linear-gradient(45deg, var(--purple-100), var(--purple-50))">
                        <div class="flex align-items-center gap-3">
                            <div class="flex align-items-center justify-content-center bg-purple-500 border-round-xl w-3rem h-3rem">
                                <i class="pi pi-book text-white text-2xl"></i>
                            </div>
                            <div>
                                <span class="block font-medium text-900 mb-1">Learn More</span>
                                <span class="text-600">Educational resources</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- News and Updates -->
        <div class="col-12 lg:col-8">
            <div class="card">
                <h5>Latest News & Updates</h5>
                <div class="flex flex-column gap-4">
                    <div v-for="(news, i) in latestNews" :key="i" 
                         class="p-3 border-round-xl surface-ground">
                        <div class="flex gap-3">                            <div :class="['w-8rem h-6rem border-round-lg flex align-items-center justify-content-center', news.iconClass]">
                                <i :class="[news.icon, 'text-4xl']"></i>
                            </div>
                            <div class="flex-1">
                                <span class="block font-medium text-sm text-primary-600 mb-2">{{ news.category }}</span>
                                <h6 class="m-0 mb-2 text-900 font-medium">{{ news.title }}</h6>
                                <p class="m-0 text-600 line-height-3">{{ news.description }}</p>
                                <span class="block text-sm text-500 mt-2">{{ news.date }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Educational Content -->
        <div class="col-12 lg:col-4">
            <div class="card">
                <h5>Learn About Waste Management</h5>
                <div class="flex flex-column gap-3">
                    <div v-for="(topic, i) in educationalTopics" :key="i"
                         class="p-3 border-round-xl surface-ground hover:surface-hover cursor-pointer transition-colors transition-duration-300">
                        <div class="flex align-items-center gap-3">
                            <div class="flex align-items-center justify-content-center" 
                                 :class="topic.iconBg + ' border-round-xl w-3rem h-3rem'">
                                <i :class="topic.icon + ' text-xl'" :style="{ color: topic.iconColor }"></i>
                            </div>
                            <div class="flex-1">
                                <h6 class="m-0 mb-1">{{ topic.title }}</h6>
                                <p class="m-0 text-600 text-sm line-height-3">{{ topic.description }}</p>
                            </div>
                            <Button icon="pi pi-arrow-right" 
                                    class="p-button-rounded p-button-text" />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Health Benefits -->
        <div class="col-12">
            <div class="card">
                <h5>Health & Environmental Benefits</h5>
                <div class="grid">
                    <div v-for="(benefit, i) in healthBenefits" :key="i" class="col-12 md:col-6 lg:col-3">
                        <div class="p-3 border-round-xl surface-ground h-full">
                            <div class="flex flex-column align-items-center text-center gap-3">
                                <div class="flex align-items-center justify-content-center w-4rem h-4rem border-round-xl"
                                     :class="benefit.iconBg">
                                    <i :class="benefit.icon + ' text-2xl'" :style="{ color: benefit.iconColor }"></i>
                                </div>
                                <h6 class="m-0">{{ benefit.title }}</h6>
                                <p class="m-0 text-600 line-height-3">{{ benefit.description }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import Button from 'primevue/button';

// Latest News Data
const latestNews = ref([
    {
        category: 'Community Initiative',
        title: 'Mangalore Beach Cleanup Drive This Weekend',
        description: 'Join us this Saturday for a community beach cleanup initiative at Panambur Beach. Learn about waste segregation and marine conservation.',            icon: 'pi pi-heart',
            iconClass: 'bg-blue-100 text-blue-500',
        date: 'June 15, 2025'
    },
    {
        category: 'Local News',
        title: 'New Recycling Center Opens in Mangalore',
        description: 'State-of-the-art recycling facility opens in Mangalore Industrial Area, capable of processing 100 tons of waste daily.',            icon: 'pi pi-sync',
            iconClass: 'bg-green-100 text-green-500',
        date: 'June 14, 2025'
    },
    {
        category: 'Education',
        title: 'Waste Management Workshop for Rural Communities',
        description: 'Free workshop on sustainable waste management practices for rural communities around Mangalore.',            icon: 'pi pi-users',
            iconClass: 'bg-orange-100 text-orange-500',
        date: 'June 13, 2025'
    }
]);

// Educational Topics
const educationalTopics = ref([
    {
        title: 'Waste Segregation Guide',
        description: 'Learn how to properly separate different types of waste',
        icon: 'pi pi-list',
        iconBg: 'bg-blue-50',
        iconColor: '#2196F3'
    },
    {
        title: 'Composting at Home',
        description: 'Start your own composting project with kitchen waste',
        icon: 'pi pi-heart',
        iconBg: 'bg-green-50',
        iconColor: '#4CAF50'
    },
    {
        title: 'Reduce & Reuse Tips',
        description: 'Simple ways to minimize waste in daily life',
        icon: 'pi pi-refresh',
        iconBg: 'bg-orange-50',
        iconColor: '#FF9800'
    },
    {
        title: 'Rural Waste Management',
        description: 'Best practices for waste handling in rural areas',
        icon: 'pi pi-home',
        iconBg: 'bg-purple-50',
        iconColor: '#9C27B0'
    }
]);

// Health Benefits
const healthBenefits = ref([
    {
        title: 'Clean Environment',
        description: 'Proper waste disposal reduces disease spread and creates a healthier living space',
        icon: 'pi pi-heart',
        iconBg: 'bg-pink-50',
        iconColor: '#E91E63'
    },
    {
        title: 'Better Air Quality',
        description: 'Preventing waste burning improves air quality and respiratory health',
        icon: 'pi pi-cloud',
        iconBg: 'bg-cyan-50',
        iconColor: '#00BCD4'
    },
    {
        title: 'Water Protection',
        description: 'Safe disposal prevents water contamination and protects marine life',
        icon: 'pi pi-filter',
        iconBg: 'bg-blue-50',
        iconColor: '#2196F3'
    },
    {
        title: 'Sustainable Future',
        description: 'Proper waste management ensures a cleaner environment for future generations',
        icon: 'pi pi-globe',
        iconBg: 'bg-green-50',
        iconColor: '#4CAF50'
    }
]);
</script>

<style lang="scss" scoped>
.featured-article {
    background: linear-gradient(135deg, var(--surface-0) 0%, var(--surface-50) 100%);
    
    img {
        transition: transform 0.3s ease;
    }
    
    &:hover img {
        transform: scale(1.05);
    }
}

// Glass effect for cards
.card {
    background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.1) 0%,
        rgba(255, 255, 255, 0.05) 100%
    );
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 16px rgba(0,0,0,0.1);
    }
}

// Dark theme adjustments
:deep([data-pc-theme="dark"]) {
    .card {
        background: linear-gradient(
            135deg,
            rgba(30, 30, 30, 0.95) 0%,
            rgba(20, 20, 20, 0.95) 100%
        );
        border-color: rgba(255, 255, 255, 0.05);
    }
    
    .surface-ground {
        background: rgba(30, 30, 30, 0.5);
    }
}
</style>
