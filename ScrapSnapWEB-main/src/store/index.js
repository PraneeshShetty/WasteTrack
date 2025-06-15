import { defineStore } from 'pinia';
import { ref } from "vue";
import axios from "@/axios";
import { jwtDecode } from "jwt-decode";

export const useStore = defineStore('app', () => {
    const token = ref(null)
    const user = ref(null)
    const loggedIn = ref(false)
    const userPermissions = ref([])

    // actions
    const login = (newToken, newUser) => {
        // Remove any image references from user data
        const { image, avatar, ...userWithoutImage } = newUser;
        
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userWithoutImage));
        localStorage.setItem('loggedIn', 'true');
        token.value = newToken;
        user.value = userWithoutImage;
    }

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('loggedIn');
        token.value = null;
        user.value = null;
        loggedIn.value = false;
        userPermissions.value = [];
    }

    const setUser = (newUser) => {
        // Remove any image references from user data
        const { image, avatar, ...userWithoutImage } = newUser;
        user.value = userWithoutImage;
        localStorage.setItem('user', JSON.stringify(userWithoutImage));
    }

    const setLoggedIn = (newLoggedIn) => {
        loggedIn.value = newLoggedIn;
        localStorage.setItem('loggedIn', newLoggedIn);
    }

    const updateUserPermissions = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/permissions`);
            userPermissions.value = response.data;
        } catch (error) {
            console.error('Error updating permissions:', error);
            userPermissions.value = [];
        }
    }

    // getters
    const getUser = () => {
        if (!user.value && localStorage.getItem('user')) {
            try {
                const storedUser = JSON.parse(localStorage.getItem('user'));
                // Remove any image references from stored user data
                const { image, avatar, ...userWithoutImage } = storedUser;
                user.value = userWithoutImage;
            } catch (e) {
                console.error('Error parsing stored user:', e);
                user.value = null;
            }
        }
        return user.value;
    }

    const getToken = () => {
        if (!token.value && localStorage.getItem('token')) {
            token.value = localStorage.getItem('token');
        }
        return token.value;
    }

    const isLoggedIn = () => {
        if (!loggedIn.value && localStorage.getItem('loggedIn')) {
            loggedIn.value = localStorage.getItem('loggedIn') === 'true';
        }
        return loggedIn.value;
    }

    const getUserPermissions = () => userPermissions.value;

    return {
        login,
        logout,
        setUser,
        setLoggedIn,
        updateUserPermissions,
        getUser,
        getToken,
        isLoggedIn,
        getUserPermissions
    }
});
