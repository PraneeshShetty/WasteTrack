<template>
    <div class="layout-topbar">
        <router-link to="/" class="layout-topbar-logo">
            <img :src="logoUrl" alt="WasteTrack logo" class="brand-logo" />
            <span class="brand-text">WasteTrack</span>
        </router-link>

        <button class="p-link layout-menu-button layout-topbar-button" @click="onMenuToggle">
            <i class="pi pi-bars" />
        </button>

        <div class="layout-topbar-menu" :class="topbarMenuClasses">
            <!-- Theme Toggle Button -->
            <button class="p-link layout-topbar-button theme-toggle" @click="toggleTheme">
                <i :class="isDarkTheme ? 'pi pi-sun' : 'pi pi-moon'" />
                <span>{{ isDarkTheme ? 'Light Mode' : 'Dark Mode' }}</span>
            </button>

            <!-- User Menu -->
            <div class="user-menu">
                <button class="p-link user-button" @click="toggleUserMenu">
                    <div class="user-button-content">
                        <i class="pi pi-user" style="font-size: 1.5rem"></i>
                        <span class="user-name">{{ user?.name || 'Guest' }}</span>
                        <i class="pi pi-chevron-down" />
                    </div>
                </button>

                <!-- User Menu Dropdown -->
                <transition name="fade">
                    <div v-if="userMenuVisible" class="user-menu-dropdown">
                        <div class="user-info">
                            <div class="user-icon">
                                <i class="pi pi-user" style="font-size: 2rem"></i>
                            </div>
                            <div class="user-details">
                                <h5>{{ user?.name || 'Guest' }}</h5>
                                <p>{{ user?.email }}</p>
                            </div>
                        </div>
                        <div class="menu-items">
                            <router-link to="/user-profile" class="menu-item" @click="userMenuVisible = false">
                                <i class="pi pi-user"></i>
                                <span>Profile</span>
                            </router-link>
                            <router-link to="/settings" class="menu-item" @click="userMenuVisible = false">
                                <i class="pi pi-cog"></i>
                                <span>Settings</span>
                            </router-link>
                            <div class="separator"></div>
                            <a @click="logout" class="menu-item">
                                <i class="pi pi-sign-out"></i>
                                <span>Logout</span>
                            </a>
                        </div>
                    </div>
                </transition>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { useRouter } from "vue-router";
import { useStore } from "@/store";

const { layoutConfig, onMenuToggle, changeTheme } = useLayout();
const router = useRouter();
const store = useStore();
const isDarkTheme = computed(() => layoutConfig.darkTheme.value);

const outsideClickListener = ref(null);
const topbarMenuActive = ref(false);
const userMenuVisible = ref(false);

const toggleTheme = () => {
    changeTheme(isDarkTheme.value ? 'light' : 'dark');
};

onMounted(() => {
    bindOutsideClickListener();
});

onBeforeUnmount(() => {
    unbindOutsideClickListener();
});

const user = computed(() => store.getUser());

const logoUrl = computed(() => {
    return `/icons/${layoutConfig.darkTheme.value ? 'icon-512x512' : 'icon-512x512'}.png`;
});

const onTopBarMenuButton = () => {
    topbarMenuActive.value = !topbarMenuActive.value;
};

const topbarMenuClasses = computed(() => {
    return {
        'layout-topbar-menu-mobile-active': topbarMenuActive.value
    };
});

const toggleUserMenu = () => {
    userMenuVisible.value = !userMenuVisible.value;
};

const bindOutsideClickListener = () => {
    if (!outsideClickListener.value) {
        outsideClickListener.value = (event) => {
            if (isOutsideClicked(event)) {
                topbarMenuActive.value = false;
                userMenuVisible.value = false;
            }
        };
        document.addEventListener('click', outsideClickListener.value);
    }
};

const unbindOutsideClickListener = () => {
    if (outsideClickListener.value) {
        document.removeEventListener('click', outsideClickListener.value);
        outsideClickListener.value = null;
    }
};

const isOutsideClicked = (event) => {
    const userMenuEl = document.querySelector('.user-menu');
    const topbarMenuEl = document.querySelector('.layout-topbar-menu');
    const topbarEl = document.querySelector('.layout-topbar-menu-button');

    const clickedUserMenu = userMenuEl?.contains(event.target) || userMenuEl?.isSameNode(event.target);
    const clickedTopbarMenu = topbarMenuEl?.contains(event.target) || topbarMenuEl?.isSameNode(event.target);
    const clickedTopbarButton = topbarEl?.contains(event.target) || topbarEl?.isSameNode(event.target);

    return !(clickedUserMenu || clickedTopbarMenu || clickedTopbarButton);
};

const logout = async () => {
    try {
        store.logout();
        await router.push({ path: '/auth/login' });
    } catch (error) {
        console.error('Logout failed:', error);
    }
};
</script>

<style lang="scss" scoped>
.layout-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1.5rem;
    background: var(--surface-card);
    box-shadow: var(--card-shadow);
    position: relative;
    backdrop-filter: blur(10px);
    
    .layout-topbar-logo {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        text-decoration: none;
        
        .brand-logo {
            width: 2.5rem;
            height: 2.5rem;
            transition: transform 0.3s ease;
            
            &:hover {
                transform: rotate(-10deg);
            }
        }
        
        .brand-text {
            font-size: 1.25rem;
            font-weight: 700;
            letter-spacing: 0.05em;
            background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-400) 100%);
            background-clip: text;
            -webkit-background-clip: text;
            color: transparent;
            -webkit-text-fill-color: transparent;
        }
    }

    .theme-toggle {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        border-radius: 2rem;
        transition: all 0.3s ease;
        background: var(--surface-ground);
        
        i {
            font-size: 1.2rem;
            color: var(--primary-color);
        }
        
        &:hover {
            transform: translateY(-2px);
            background: var(--surface-hover);
        }
    }

    .user-menu {
        position: relative;

        .user-button {
            padding: 0.5rem;
            border: none;
            background: transparent;
            cursor: pointer;
            transition: all 0.3s ease;
            
            &:hover {
                background: var(--surface-hover);
                transform: translateY(-2px);
            }
            
            .user-button-content {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                
                .user-name {
                    font-weight: 500;
                    color: var(--text-color);
                }

                .pi-chevron-down {
                    transition: transform 0.3s ease;
                }
            }

            &:hover .pi-chevron-down {
                transform: translateY(2px);
            }
        }

        .user-menu-dropdown {
            position: absolute;
            top: 100%;
            right: 0;
            margin-top: 0.5rem;
            min-width: 280px;
            background: var(--surface-overlay);
            border-radius: 0.5rem;
            box-shadow: var(--card-shadow);
            z-index: 1000;
            
            .user-info {
                padding: 1rem;
                display: flex;
                align-items: center;
                gap: 1rem;
                border-bottom: 1px solid var(--surface-border);
                
                .user-icon {
                    width: 3rem;
                    height: 3rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--primary-color);
                    color: var(--primary-color-text);
                    border-radius: 50%;
                }
                
                .user-details {
                    h5 {
                        margin: 0;
                        color: var(--text-color);
                        font-size: 1.1rem;
                    }
                    
                    p {
                        margin: 0.25rem 0 0;
                        color: var(--text-color-secondary);
                        font-size: 0.9rem;
                    }
                }
            }
            
            .menu-items {
                padding: 0.5rem;
                
                .menu-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem 1rem;
                    color: var(--text-color);
                    text-decoration: none;
                    border-radius: 0.375rem;
                    transition: all 0.2s ease;
                    cursor: pointer;
                    
                    i {
                        font-size: 1.1rem;
                        color: var(--text-color-secondary);
                    }
                    
                    &:hover {
                        background: var(--surface-hover);
                        transform: translateX(4px);
                    }
                    
                    &:active {
                        transform: translateX(4px) scale(0.98);
                    }
                }
                
                .separator {
                    height: 1px;
                    background: var(--surface-border);
                    margin: 0.5rem 0;
                }
            }
        }
    }
}

// Animation
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

// Responsive styles
@media screen and (max-width: 768px) {
    .layout-topbar {
        padding: 0.5rem 1rem;
        
        .layout-topbar-menu {
            position: fixed;
            top: 61px;
            right: 0;
            flex-direction: column;
            background: var(--surface-overlay);
            box-shadow: var(--card-shadow);
            padding: 1rem;
            transition: transform 0.3s ease;
            transform: translateX(100%);
            
            &.layout-topbar-menu-mobile-active {
                transform: translateX(0);
            }
            
            .theme-toggle {
                margin-bottom: 0.5rem;
            }
        }
    }
}
</style>
