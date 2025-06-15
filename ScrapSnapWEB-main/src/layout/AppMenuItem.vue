<script setup>
import { ref, onBeforeMount, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useLayout } from '@/layout/composables/layout';

const route = useRoute();

const { layoutConfig, layoutState, setActiveMenuItem, onMenuToggle } = useLayout();

const props = defineProps({
    item: {
        type: Object,
        default: () => ({})
    },
    index: {
        type: Number,
        default: 0
    },
    root: {
        type: Boolean,
        default: true
    },
    parentItemKey: {
        type: String,
        default: null
    }
});

const isActiveMenu = ref(false);
const itemKey = ref(null);

onBeforeMount(() => {
    itemKey.value = props.parentItemKey ? props.parentItemKey + '-' + props.index : String(props.index);

    const activeItem = layoutState.activeMenuItem;

    isActiveMenu.value = activeItem === itemKey.value || activeItem ? activeItem.startsWith(itemKey.value + '-') : false;
});

watch(
    () => layoutConfig.activeMenuItem.value,
    (newVal) => {
        isActiveMenu.value = newVal === itemKey.value || newVal.startsWith(itemKey.value + '-');
    }
);
const itemClick = (event, item) => {
    if (item.disabled) {
        event.preventDefault();
        return;
    }

    const { overlayMenuActive, staticMenuMobileActive } = layoutState;

    if ((item.to || item.url) && (staticMenuMobileActive.value || overlayMenuActive.value)) {
        onMenuToggle();
    }

    if (item.command) {
        item.command({ originalEvent: event, item: item });
    }

    const foundItemKey = item.items ? (isActiveMenu.value ? props.parentItemKey : itemKey) : itemKey.value;

    setActiveMenuItem(foundItemKey);
};

const checkActiveRoute = (item) => {
    return route.path === item.to;
};
</script>

<template>
    <li :class="{ 'layout-root-menuitem': root, 'active-menuitem': isActiveMenu }">
        <div v-if="root && item.visible !== false" class="layout-menuitem-root-text">{{ item.label }}</div>
        <a v-if="(!item.to || item.items) && item.visible !== false" :href="item.url" @click="itemClick($event, item, index)" :class="item.class" :target="item.target" tabindex="0">
            <i :class="item.icon" class="layout-menuitem-icon"></i>
            <span class="layout-menuitem-text">{{ item.label }}</span>
            <i class="pi pi-fw pi-angle-down layout-submenu-toggler" v-if="item.items"></i>
        </a>
        <router-link v-if="item.to && !item.items && item.visible !== false" @click="itemClick($event, item, index)" :class="[item.class, { 'active-route': checkActiveRoute(item) }]" tabindex="0" :to="item.to">
            <i :class="item.icon" class="layout-menuitem-icon"></i>
            <span class="layout-menuitem-text">{{ item.label }}</span>
            <i class="pi pi-fw pi-angle-down layout-submenu-toggler" v-if="item.items"></i>
        </router-link>
        <Transition v-if="item.items && item.visible !== false" name="layout-submenu">
            <ul v-show="root ? true : isActiveMenu" class="layout-submenu">
                <app-menu-item v-for="(child, i) in item.items" :key="child" :index="i" :item="child" :parentItemKey="itemKey" :root="false"></app-menu-item>
            </ul>
        </Transition>
    </li>
</template>

<style lang="scss" scoped>
.layout-root-menuitem {
  position: relative;
  margin-bottom: 0.5rem;
  
  .layout-menuitem-root-text {
    font-size: 0.875rem;
    text-transform: uppercase;
    font-weight: 600;
    color: var(--surface-900);
    padding: 0.5rem 0;
    opacity: 0.7;
  }
}

a,
router-link {
  position: relative;
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: var(--text-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  
  // Modern hover effect
  &:hover {
    background: rgba(var(--primary-color-rgb), 0.1);
    transform: translateX(4px) translateY(-1px);
    
    // 3D shadow effect
    box-shadow: 
      0 4px 8px -2px rgba(0,0,0,0.1),
      0 2px 4px -1px rgba(0,0,0,0.06);
    
    .layout-menuitem-icon {
      transform: scale(1.1) translateZ(10px);
      color: var(--primary-color);
    }
    
    .layout-menuitem-text {
      color: var(--primary-color);
      font-weight: 600;
    }
    
    // Glow effect
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 8px;
      padding: 2px;
      background: linear-gradient(
        45deg,
        var(--primary-color),
        transparent
      );
      mask: linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      opacity: 0.5;
    }
  }
  
  &.active-route {
    background: var(--primary-color);
    color: var(--primary-color-text);
    font-weight: 600;
    transform: translateX(4px);
    
    .layout-menuitem-icon,
    .layout-menuitem-text {
      color: inherit;
    }
    
    // 3D pressed effect
    box-shadow: 
      inset 0 2px 4px rgba(0,0,0,0.1),
      0 2px 4px rgba(var(--primary-color-rgb), 0.2);
  }
}

.layout-menuitem-icon {
  font-size: 1.25rem;
  margin-right: 0.75rem;
  transition: all 0.3s ease;
  
  // 3D effect
  transform-style: preserve-3d;
  backface-visibility: hidden;
}

.layout-menuitem-text {
  transition: color 0.3s ease;
  font-weight: 500;
}

.layout-submenu-toggler {
  margin-left: auto;
  transition: transform 0.3s ease;
}

.active-menuitem {
  > a .layout-submenu-toggler {
    transform: rotate(-180deg);
  }
}

// Submenu styling
.layout-submenu {
  list-style: none;
  margin: 0;
  padding: 0;
  overflow: hidden;
  
  // Nested items
  a,
  router-link {
    padding-left: 2.5rem;
    font-size: 0.875rem;
    
    &:hover {
      transform: translateX(2px) translateY(-1px);
    }
    
    .layout-menuitem-icon {
      font-size: 1rem;
    }
  }
}

// Animation for submenu
.layout-submenu-enter-active,
.layout-submenu-leave-active {
  transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out;
  overflow: hidden;
}

.layout-submenu-enter-from,
.layout-submenu-leave-to {
  max-height: 0;
  opacity: 0;
}

.layout-submenu-enter-to,
.layout-submenu-leave-from {
  max-height: 500px;
  opacity: 1;
}

// Dark theme adjustments
:deep([data-pc-theme="dark"]) {
  .layout-menuitem-root-text {
    color: var(--surface-200);
  }
  
  a,
  router-link {
    color: var(--surface-100);
    
    &:hover {
      background: rgba(255,255,255,0.03);
      
      &::after {
        opacity: 0.3;
      }
    }
    
    &.active-route {
      background: var(--primary-600);
      box-shadow: 
        inset 0 2px 4px rgba(0,0,0,0.2),
        0 2px 4px rgba(var(--primary-600-rgb), 0.3);
    }
  }
}
</style>
