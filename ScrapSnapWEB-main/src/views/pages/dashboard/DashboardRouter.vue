<template>
    <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
            <component :is="Component" />
        </transition>
    </router-view>
</template>

<script setup>
import { onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from '@/store';

const store = useStore();
const router = useRouter();

const redirectBasedOnRole = async () => {
    const userData = localStorage.getItem('user');
    const user = userData ? JSON.parse(userData) : null;
    
    if (!user) {
        router.replace('/auth/login');
        return;
    }

    // Check user role from roleId
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/roles/${user.roleId}`);
        const roleData = await response.json();
        
        if (roleData.name === 'Admin') {
            router.replace('/admin/dashboard');
        } else {
            router.replace('/user/dashboard');
        }
    } catch (error) {
        console.error('Error fetching role:', error);
        // Default to user dashboard if role check fails
        router.replace('/user/dashboard');
    }
};

// Redirect on mount
onMounted(() => {
    redirectBasedOnRole();
});

// Watch for user changes
watch(() => store.user, (newUser) => {
    if (newUser) {
        redirectBasedOnRole();
    } else {
        router.replace('/auth/login');
    }
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
