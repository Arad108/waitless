// src/services/api.ts
import axios from 'axios';
import { HealthFacility } from '../types/health';

const API_BASE_URL = 'http://localhost:5000/api';

export const healthFacilityApi = {
    getAllFacilities: async () => {
        const response = await axios.get<{ status: string; data: HealthFacility[] }>(
            `${API_BASE_URL}/health-facilities`
        );
        return response.data;
    },

    getFacilityById: async (id: string) => {
        const response = await axios.get<{ status: string; data: HealthFacility }>(
            `${API_BASE_URL}/health-facilities/${id}`
        );
        return response.data;
    },

    searchFacilities: async (query: string) => {
        const response = await axios.get<{ status: string; data: HealthFacility[] }>(
            `${API_BASE_URL}/health-facilities/search?query=${query}`
        );
        return response.data;
    }
};