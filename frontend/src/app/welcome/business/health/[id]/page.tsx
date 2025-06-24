// src/app/welcome/business/health/[id]/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardNav from '../../../../DashboardNav';
import { MapPin, Phone, Star, Globe, Clock, Check, Mail, Calendar, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface OpeningHours {
    open: string;
    close: string;
}

interface DailyHours {
    [key: string]: OpeningHours;
    monday: OpeningHours;
    tuesday: OpeningHours;
    wednesday: OpeningHours;
    thursday: OpeningHours;
    friday: OpeningHours;
    saturday: OpeningHours;
    sunday: OpeningHours;
}

interface HealthFacility {
    _id: string;
    name: string;
    type: string;
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
}

const FacilityDetail = () => {
    const params = useParams();
    const router = useRouter();
    const [facility, setFacility] = useState<HealthFacility | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFacilityDetails();
    }, [params.id]);

    const fetchFacilityDetails = async () => {
        try {
            console.log('Fetching details for ID:', params.id);
            setLoading(true);
            const response = await fetch(`http://localhost:5000/api/health-facilities/${params.id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch facility details');
            }

            const data = await response.json();
            console.log('Facility data:', data);
            
            if (data.status === 'success') {
                setFacility(data.data);
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to load facility details');
        } finally {
            setLoading(false);
        }
    };

    const handleBookAppointment = (service: string) => {
        router.push(`/welcome/business/health/${params.id}/book?service=${encodeURIComponent(service)}`);
    };

    const handleBack = () => {
        router.push('/welcome/business/health');
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

    if (!facility) {
        return (
            <div className="min-h-screen bg-gray-50">
                <DashboardNav />
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900">Facility not found</h2>
                        <button
                            onClick={handleBack}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Facilities
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardNav />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button */}
                <button
                    onClick={handleBack}
                    className="mb-6 inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Facilities
                </button>

                {/* Facility Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/3">
                            <img
                                src={facility.images[0]?.url || '/default-hospital.jpg'}
                                alt={facility.name}
                                className="w-full h-64 object-cover rounded-lg"
                            />
                        </div>
                        <div className="md:w-2/3 md:pl-6 mt-4 md:mt-0">
                            <div className="flex items-center justify-between">
                                <h1 className="text-3xl font-bold text-gray-900">{facility.name}</h1>
                                {facility.isVerified && (
                                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                        Verified
                                    </span>
                                )}
                            </div>
                            
                            <div className="mt-2 flex items-center">
                                <Star className="w-5 h-5 text-yellow-400" />
                                <span className="ml-1 text-gray-700">{facility.rating}</span>
                                <span className="ml-2 text-gray-500">({facility.totalRatings} reviews)</span>
                            </div>

                            <div className="mt-4 space-y-2">
                                <p className="flex items-center text-gray-600">
                                    <MapPin className="w-5 h-5 mr-2" />
                                    {facility.address.street}, {facility.address.city}, {facility.address.state}
                                </p>
                                <p className="flex items-center text-gray-600">
                                    <Phone className="w-5 h-5 mr-2" />
                                    {facility.contact.phone}
                                </p>
                                <p className="flex items-center text-gray-600">
                                    <Mail className="w-5 h-5 mr-2" />
                                    {facility.contact.email}
                                </p>
                                <p className="flex items-center text-gray-600">
                                    <Globe className="w-5 h-5 mr-2" />
                                    <a 
                                        href={facility.contact.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                    >
                                        Visit Website
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Services */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-2xl font-semibold mb-4">Our Services</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {facility.services.map((service, index) => (
                            <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <h3 className="font-semibold text-lg mb-2">{service}</h3>
                                <button
                                    className="mt-2 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    onClick={() => handleBookAppointment(service)}
                                >
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Book Appointment
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Special Features */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-2xl font-semibold mb-4">Special Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {facility.specialFeatures.map((feature, index) => (
                            <div key={index} className="flex items-center p-2 hover:bg-gray-50 rounded-md">
                                <Check className="w-5 h-5 text-green-500 mr-2" />
                                <span>{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Opening Hours */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-2xl font-semibold mb-4">Opening Hours</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(facility.openingHours).map(([day, hours]) => (
                            <div key={day} className="flex justify-between py-2 border-b last:border-b-0">
                                <span className="capitalize">{day}</span>
                                <div className="flex items-center">
                                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                    <span>{hours.open} - {hours.close}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FacilityDetail;