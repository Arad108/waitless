// src/types/appointment.ts

// Appointment related types
export interface Appointment {
    _id: string;
    businessId: {
        _id: string;
        name: string;
        address: string;
        contact: {
            phone: string;
            email: string;
        };
    };
    serviceId: {
        _id: string;
        name: string;
        duration: number;
        price: number;
    };
    userId: {
        _id: string;
        full_name: string;
        email: string;
    };
    appointmentTime: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

// Business related types
export interface Business {
    _id: string;
    name: string;
    type: 'hospital' | 'clinic' | 'lab' | 'pharmacy';
    address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    contact: {
        phone: string;
        email: string;
        website?: string;
    };
    location: {
        type: 'Point';
        coordinates: [number, number]; // [longitude, latitude]
    };
    rating: number;
    totalRatings: number;
    services: string[];
    openingHours: {
        monday: { open: string; close: string };
        tuesday: { open: string; close: string };
        wednesday: { open: string; close: string };
        thursday: { open: string; close: string };
        friday: { open: string; close: string };
        saturday: { open: string; close: string };
        sunday: { open: string; close: string };
    };
    images: Array<{
        url: string;
        alt: string;
    }>;
    isVerified: boolean;
    isActive: boolean;
}

// Service related types
export interface Service {
    _id: string;
    businessId: string;
    name: string;
    description: string;
    duration: number;
    price: number;
    isAvailable: boolean;
}

// User related types
export interface User {
    _id: string;
    email: string;
    full_name: string;
    role: 'customer' | 'business_owner' | 'staff' | 'admin';
    created_at: string;
    updated_at?: string;
}

// API Response types
export interface ApiResponse<T> {
    status: 'success' | 'error';
    message?: string;
    data?: T;
    error?: string;
}

// Appointment API specific responses
export interface AppointmentResponse extends ApiResponse<Appointment> {}
export interface AppointmentsListResponse extends ApiResponse<Appointment[]> {
    pagination?: {
        total: number;
        page: number;
        pages: number;
        limit: number;
    };
}

// Business API specific responses
export interface BusinessResponse extends ApiResponse<Business> {}
export interface BusinessListResponse extends ApiResponse<Business[]> {
    pagination?: {
        total: number;
        page: number;
        pages: number;
        limit: number;
    };
}

// Location types
export interface Coordinates {
    lat: number;
    lng: number;
}

export interface LocationState {
    coordinates: Coordinates | null;
    error: string | null;
    loading: boolean;
}

// Search and Filter types
export interface SearchFilters {
    type?: string;
    service?: string;
    rating?: number;
    distance?: number;
}

export interface SortOptions {
    field: 'rating' | 'distance' | 'name';
    order: 'asc' | 'desc';
}

// Error types
export interface ApiError {
    status: number;
    message: string;
    errors?: Record<string, string[]>;
}