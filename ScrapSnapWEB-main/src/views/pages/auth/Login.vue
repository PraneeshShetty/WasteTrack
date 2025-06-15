<template>
    <div class="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
        <Toast />
        <div class="flex flex-column align-items-center justify-content-center">
            <div class="login-container" :class="{'dark-theme': layoutConfig.darkTheme.value}">
                <div class="login-card">
                    <div class="login-content">
                        <div class="text-center mb-5">
                            <img :src="logoUrl" alt="Image" height="50" class="mb-3 logo-3d" />
                            <div class="text-900 text-3xl font-medium mb-3 welcome-text">Welcome back!</div>
                            <span class="text-600 font-medium subtitle">Sign in to continue</span>
                        </div>

                        <div>
                            <label for="email1" class="block text-900 text-xl font-medium mb-2 input-label">Email</label>
                            <InputText id="email1" type="text" placeholder="Email address" class="w-full md:w-30rem mb-5 input-field" 
                                      style="padding: 1rem" v-model="email" />

                            <label for="password1" class="block text-900 font-medium text-xl mb-2 input-label">Password</label>
                            <Password id="password1" v-model="password" placeholder="Password" :toggleMask="true" 
                                     class="w-full mb-3" inputClass="w-full input-field" 
                                     :inputStyle="{ padding: '1rem' }"></Password>

                            <div class="flex align-items-center justify-content-between mb-5 gap-5 options-row">
                                <div class="flex align-items-center">
                                    <Checkbox v-model="checked" id="rememberme1" binary class="mr-2 checkbox-3d"></Checkbox>
                                    <label for="rememberme1" class="remember-label">Remember me</label>
                                </div>
                                <a class="font-medium no-underline ml-2 text-right cursor-pointer forgot-link">Forgot password?</a>
                            </div>
                            <Button label="Sign In" @click="login" class="w-full p-3 text-xl login-button"></Button>
                            <br />
                            <br />
                            <div class="text-center">
                              <a class="font-medium no-underline ml-2 text-right cursor-pointer signup-link" @click="goToSignUp">Don't have account yet? Sign up</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <AppConfig simple />
</template>

<script setup>
// Your existing script remains exactly the same
import { useLayout } from '@/layout/composables/layout';
import {ref, computed, onMounted} from 'vue';
import AppConfig from '@/layout/AppConfig.vue';
import axios from "axios";
import { useToast } from "primevue/usetoast";
import { useRouter } from 'vue-router';
import { useStore } from "@/store";
import axiosInstance from "@/axios";

const router = useRouter();
const store = useStore();
const toast = useToast();
const { layoutConfig } = useLayout();

const email = ref('');
const password = ref('');
const checked = ref(false);

const logoUrl = computed(() => {
  return `icons/${layoutConfig.darkTheme.value ? 'icon-512x512' : 'icon-512x512'}.png`;
});

const goToSignUp = () => {
  router.push('/auth/register');
}

async function login() {
  try {
    const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
      email: email.value,
      password: password.value
    });

    if (!response.data.token) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Wrong email or password', life: 3000 });
      return;
    }

    await store.login(response.data.token, response.data.user);
    await store.updateUserPermissions();
    subscribeToPushNotifications(response.data.user._id);

    if (email.value === 'userA@mail.com') {
      localStorage.setItem("test_group", "a");
    } else if (email.value === 'userB@mail.com') {
      localStorage.setItem("test_group", "b");
    } else {
      localStorage.setItem("test_group", "");
    }

    await router.push('/');
    toast.add({ severity: 'success', summary: 'Success Message', detail: 'Logged in successfully', life: 3000 });
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Wrong email or password', life: 3000 })
  }
}

const requestNotificationsPermissions = async () => {
  if ('Notification' in window) {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        console.log('Notification permission granted');
      } else {
        console.log('Notification permission denied');
      }
    });
  } else {
    console.log('Notifications are not supported');
  }
}

const requestMicrophonePermission = async () => {
  if (navigator.mediaDevices) {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        console.log('Microphone permission granted');
      })
      .catch(error => {
        console.error('Microphone permission denied:', error);
      });
  } else {
    console.log('Microphone is not supported');
  }
}

const subscribeToPushNotifications = async (userId) => {
  try {
    const registration = await navigator.serviceWorker.register('service-worker.js');

    if ('PushManager' in window) {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array('BM9rzW6qYVBYn8fsaRC9BCRJ7KeJve23aZmgNOaVcP-vhcIMBB9UbCXlk_jTA59VnVRJvzxf4VKp08dHPa9TFqo')
      });

      await axiosInstance.post(`${import.meta.env.VITE_API_BASE_URL}/subscriptions`, subscription);

      await checkAndNotifyGarbageCollection(userId)
    }
  } catch (error) {
    console.error('Service Worker registration failed:', error);
  }
}

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return new Uint8Array([...rawData].map(char => char.charCodeAt(0)));
}

const checkAndNotifyGarbageCollection = async (userId) => {
  try {
    await axios.post(`${import.meta.env.VITE_API_BASE_URL}/subscriptions/notify-user`, {
      userId: userId
    });
  } catch {}
}

onMounted(() => {
  requestNotificationsPermissions();
  requestMicrophonePermission();
});

</script>

<style scoped>
/* Light Theme (Default) */
.login-container {
    perspective: 1000px;
    width: 100%;
    max-width: 500px;
}

.login-card {
    position: relative;
    width: 100%;
    padding: 1rem;
    border-radius: 24px;
    background: white;
    box-shadow: 
        0 10px 25px rgba(0, 0, 0, 0.1),
        0 20px 40px rgba(0, 0, 0, 0.08),
        0 0 0 1px rgba(255, 255, 255, 0.1) inset,
        0 4px 6px rgba(255, 255, 255, 0.5) inset;
    transform-style: preserve-3d;
    transition: all 0.3s ease;
    border: 1px solid rgba(255, 255, 255, 0.3);
}

.login-card::before {
    content: '';
    position: absolute;
    top: -5px;
    left: -5px;
    right: -5px;
    bottom: -5px;
    border-radius: 28px;
    background: linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0));
    z-index: -1;
    transform: translateZ(-10px);
    opacity: 0.7;
}

.login-content {
    padding: 2rem;
    border-radius: 20px;
    background: white;
    transform: translateZ(20px);
}

.logo-3d {
    filter: drop-shadow(0 5px 10px rgba(0, 0, 0, 0.1));
    transition: transform 0.3s ease;
}

.logo-3d:hover {
    transform: translateY(-3px) scale(1.05);
}

.welcome-text {
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    color: #2c3e50;
}

.subtitle {
    color: #7f8c8d;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.input-label {
    color: #2c3e50;
    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
}

.input-field {
    border-radius: 12px !important;
    border: 1px solid #dfe6e9 !important;
    box-shadow: 
        inset 0 1px 3px rgba(0, 0, 0, 0.05),
        0 2px 5px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    background: white !important;
}

.input-field:hover {
    box-shadow: 
        inset 0 1px 3px rgba(0, 0, 0, 0.1),
        0 4px 8px rgba(0, 0, 0, 0.1);
}

.input-field:focus {
    border-color: var(--primary-color) !important;
    box-shadow: 
        0 0 0 2px rgba(33, 150, 243, 0.2),
        0 4px 8px rgba(0, 0, 0, 0.1) !important;
}

.checkbox-3d {
    transform: translateZ(10px);
}

.remember-label {
    color: #2c3e50;
}

.forgot-link {
    color: var(--primary-color) !important;
    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease;
}

.forgot-link:hover {
    text-shadow: 0 2px 4px rgba(33, 150, 243, 0.2);
}

.login-button {
    border-radius: 12px !important;
    background: linear-gradient(135deg, var(--primary-color), #1976D2) !important;
    border: none !important;
    box-shadow: 
        0 4px 6px rgba(0, 0, 0, 0.1),
        0 1px 3px rgba(0, 0, 0, 0.08),
        inset 0 1px 1px rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;
    transform: translateZ(5px);
}

.login-button:hover {
    transform: translateY(-2px) translateZ(5px);
    box-shadow: 
        0 7px 14px rgba(0, 0, 0, 0.1),
        0 3px 6px rgba(0, 0, 0, 0.08),
        inset 0 1px 1px rgba(255, 255, 255, 0.2);
}

.signup-link {
    color: var(--primary-color) !important;
    transition: all 0.2s ease;
    display: inline-block;
}

.signup-link:hover {
    transform: translateY(-1px);
    text-shadow: 0 2px 4px rgba(33, 150, 243, 0.2);
}

/* Dark Theme Overrides */
.dark-theme .login-card {
    background: #1a1a1a;
    box-shadow: 
        0 10px 25px rgba(0, 0, 0, 0.3),
        0 20px 40px rgba(0, 0, 0, 0.25),
        0 0 0 1px rgba(255, 255, 255, 0.05) inset,
        0 4px 6px rgba(0, 0, 0, 0.5) inset;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.dark-theme .login-card::before {
    background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0));
}

.dark-theme .login-content {
    background: #1a1a1a;
}

.dark-theme .welcome-text {
    color: #ecf0f1;
}

.dark-theme .subtitle {
    color: #bdc3c7;
}

.dark-theme .input-label {
    color: #ecf0f1;
}

.dark-theme .input-field {
    background: #2d2d2d !important;
    border-color: #3d3d3d !important;
    color: #ecf0f1 !important;
}

.dark-theme .remember-label {
    color: #ecf0f1;
}

.dark-theme .login-button {
    box-shadow: 
        0 4px 6px rgba(0, 0, 0, 0.3),
        0 1px 3px rgba(0, 0, 0, 0.25),
        inset 0 1px 1px rgba(255, 255, 255, 0.1);
}

.dark-theme .login-button:hover {
    box-shadow: 
        0 7px 14px rgba(0, 0, 0, 0.3),
        0 3px 6px rgba(0, 0, 0, 0.25),
        inset 0 1px 1px rgba(255, 255, 255, 0.1);
}
</style>