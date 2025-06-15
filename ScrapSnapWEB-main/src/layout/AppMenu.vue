<script setup>
import { ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';

const model = ref([
    {
        label: 'Home',
        items: [
            { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' },
            { label: 'Schedule', icon: 'pi pi-fw pi-calendar', to: '/schedule'},
            { label: 'Collection Points', icon: 'pi pi-fw pi-map', to: '/collection-points' }
        ]
    },
    {
        label: 'Inappropriate Disposals',
        items: [
            { label: 'Inappropriate Disposals', icon: 'pi pi-fw pi-trash', to: '/inappropriate-disposal' },
            { label: 'Upload', icon: 'pi pi-fw pi-upload', to: '/inappropriate-disposal/upload' }
        ]
    },
    {
        label: 'User',
        items: [
            { label: 'Users', icon: 'pi pi-fw pi-users', to: '/users' },
            { label: 'Roles', icon: 'pi pi-fw pi-lock', to: '/roles' },
            { label: 'Profile', icon: 'pi pi-users', to: '/user-profile' },
        ]
    }
]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped>
.layout-menu {
  list-style: none;
  margin: 0;
  padding: 1rem;
  background: var(--surface-overlay);
  border-radius: 12px;
  box-shadow: 
    0 8px 16px rgba(0,0,0,0.1),
    0 1px 3px rgba(0,0,0,0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.1);
  
  // Glass effect
  background: linear-gradient(
    135deg,
    rgba(255,255,255,0.1) 0%,
    rgba(255,255,255,0.05) 100%
  );
  
  // 3D layered effect
  transform-style: preserve-3d;
  perspective: 1000px;
  
  // Smooth transitions
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateZ(10px);
    box-shadow: 
      0 12px 24px rgba(0,0,0,0.15),
      0 2px 6px rgba(0,0,0,0.08);
  }
}

// Menu separator style
.menu-separator {
  border: none;
  border-top: 1px solid rgba(255,255,255,0.1);
  margin: 1rem 0;
  
  // Glowing effect
  &::after {
    content: '';
    display: block;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255,255,255,0.2),
      transparent
    );
    transform: translateY(-1px);
  }
}

// Dark theme adjustments
:deep([data-pc-theme="dark"]) {
  .layout-menu {
    background: linear-gradient(
      135deg,
      rgba(30,30,30,0.95) 0%,
      rgba(20,20,20,0.95) 100%
    );
    border-color: rgba(255,255,255,0.05);
  }
}
</style>
