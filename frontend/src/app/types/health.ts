// src/types/health.ts
interface OpeningHours {
    open: string;
    close: string;
}

interface DailyHours {
    monday: OpeningHours;
    tuesday: OpeningHours;
    wednesday: OpeningHours;
    thursday: OpeningHours;
    friday: OpeningHours;
    saturday: OpeningHours;
    sunday: OpeningHours;
}

export interface HealthFacility {
    _id: string;
    name: string;
    type: 'hospital' | 'clinic' | 'lab' | 'pharmacy';
    location: {
        type: string;
        coordinates: [number, number];
    };
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
        website: string;
    };
    rating: number;
    totalRatings: number;
    services: string[];
    openingHours: DailyHours;
    images: Array<{
        url: string;
        alt: string;
    }>;
    specialFeatures: string[];
    isVerified: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}