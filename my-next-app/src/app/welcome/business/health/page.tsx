// src/app/welcome/business/health/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardNav from '../../../DashboardNav';
import { MapPin, Phone, Star, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface HealthFacility {
    _id: string;
    name: string;
    type: string;
    address: {
        street: string;
        city: string;
        state: string;
        country: string;
        zipCode: string;
    };
    contact: {
        phone: string;
        email: string;
        website: string;
    };
    rating: number;
    totalRatings: number;
    services: string[];
    images: Array<{
        url: string;
        alt: string;
    }>;
    isVerified: boolean;
    isActive: boolean;
}

const HealthPage: React.FC = () => {
    const [facilities, setFacilities] = useState<HealthFacility[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    useEffect(() => {
        fetchFacilities();
    }, []);

    const fetchFacilities = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5000/api/health-facilities', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch facilities');
            }

            const data = await response.json();
            console.log('Fetched facilities:', data); // Debug log
            
            if (data.status === 'success' && Array.isArray(data.data)) {
                setFacilities(data.data);
            }
        } catch (error) {
            console.error('Error fetching facilities:', error);
            toast.error('Failed to load facilities');
        } finally {
            setLoading(false);
        }
    };

    const filteredFacilities = facilities.filter(facility =>
        facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        facility.address.city.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleFacilityClick = (facilityId: string) => {
        router.push(`/welcome/business/health/${facilityId}`);
    };

    const handleBookClick = (e: React.MouseEvent, facilityId: string) => {
        e.stopPropagation();
        router.push(`/welcome/business/health/${facilityId}/book`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <DashboardNav />
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardNav />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Healthcare Services</h1>
                    <p className="mt-2 text-gray-600">Find and book appointments with top healthcare providers</p>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or location..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Facilities Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredFacilities.map((facility) => (
                        <div
                            key={facility._id}
                            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
                            onClick={() => handleFacilityClick(facility._id)}
                        >
                            <div className="relative h-48">
                                <img
                                    src={facility.images[0]?.url || '/default-hospital.jpg'}
                                    alt={facility.name}
                                    className="w-full h-full object-cover rounded-t-lg"
                                />
                                {facility.isVerified && (
                                    <div className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                        Verified
                                    </div>
                                )}
                            </div>
                            
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900">{facility.name}</h3>
                                    <div className="flex items-center">
                                        <Star className="w-4 h-4 text-yellow-400" />
                                        <span className="ml-1 text-sm text-gray-700">{facility.rating}</span>
                                    </div>
                                </div>
                                
                                <div className="text-sm text-gray-500">
                                    <div className="flex items-center mb-1">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        {facility.address.city}, {facility.address.state}
                                    </div>
                                    <div className="flex items-center">
                                        <Phone className="w-4 h-4 mr-1" />
                                        {facility.contact.phone}
                                    </div>
                                </div>

                                <div className="mt-3">
                                    <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                                        {facility.type}
                                    </span>
                                </div>

                                <button
                                    className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200"
                                    onClick={(e) => handleBookClick(e, facility._id)}
                                >
                                    Book Appointment
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredFacilities.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No health facilities found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HealthPage;