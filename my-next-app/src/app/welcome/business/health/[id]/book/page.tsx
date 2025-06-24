// src/app/welcome/business/health/[id]/book/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import DashboardNav from '../../../../../DashboardNav';
import { Calendar, Clock, User, Phone, Mail, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface HealthFacility {
    _id: string;
    name: string;
    services: string[];
    openingHours: {
        [key: string]: {
            open: string;
            close: string;
        };
    };
    address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
    };
    contact: {
        phone: string;
        email: string;
    };
}

interface BookingForm {
    name: string;
    phone: string;
    email: string;
    date: string;
    time: string;
    service: string;
}

interface PageParams {
    id: string;
}

const BookingPage = () => {
    const params = useParams() as unknown as PageParams;
    const router = useRouter();
    const searchParams = useSearchParams();
    const [facility, setFacility] = useState<HealthFacility | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [availableServices, setAvailableServices] = useState<string[]>([]);
    const [bookingForm, setBookingForm] = useState<BookingForm>({
        name: '',
        phone: '',
        email: '',
        date: '',
        time: '',
        service: searchParams.get('service') || ''
    });

    const fetchHospitalDetails = async (hospitalId: string) => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:5000/api/health-facilities/${hospitalId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch hospital details');
            }

            const data = await response.json();
            if (data.status === 'success') {
                setFacility(data.data);
                setAvailableServices(data.data.services);
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to load hospital details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (params.id && typeof params.id === 'string') {
            fetchHospitalDetails(params.id);
        }
    }, [params.id]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setBookingForm({
            ...bookingForm,
            [e.target.name]: e.target.value
        });
    };

    const validateForm = () => {
        if (!bookingForm.service) {
            toast.error('Please select a service');
            return false;
        }
        if (!bookingForm.name.trim()) {
            toast.error('Please enter your name');
            return false;
        }
        if (!bookingForm.phone.match(/^\d{10}$/)) {
            toast.error('Please enter a valid 10-digit phone number');
            return false;
        }
        if (!bookingForm.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            toast.error('Please enter a valid email address');
            return false;
        }
        if (!bookingForm.date || !bookingForm.time) {
            toast.error('Please select both date and time');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            setSubmitting(true);
            
            const appointmentDateTime = new Date(`${bookingForm.date}T${bookingForm.time}`);
            
            if (!params.id || typeof params.id !== 'string') {
                throw new Error('Invalid facility ID');
            }

            const response = await fetch('http://localhost:5000/api/appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                credentials: 'include',
                body: JSON.stringify({
                    businessId: params.id,
                    facilityId: params.id,
                    appointmentTime: appointmentDateTime.toISOString(),
                    service: bookingForm.service,
                    serviceId: { name: bookingForm.service },
                    customerName: bookingForm.name,
                    customerPhone: bookingForm.phone,
                    customerEmail: bookingForm.email,
                    status: 'scheduled'
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to book appointment');
            }

            if (data.status === 'success') {
                toast.success('Appointment booked successfully!');
                router.push('/welcome');
            }
        } catch (error: any) {
            console.error('Booking error:', error);
            toast.error(error.message || 'Failed to book appointment');
        } finally {
            setSubmitting(false);
        }
    };

    const handleBack = () => {
        router.back();
    };

    // Get today's date in YYYY-MM-DD format for min date in date picker
    const today = new Date().toISOString().split('T')[0];

    // Get date 30 days from now for max date
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    const maxDateString = maxDate.toISOString().split('T')[0];

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
                <div className="max-w-3xl mx-auto px-4 py-8">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900">Facility not found</h2>
                        <button
                            onClick={handleBack}
                            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardNav />
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <button
                    onClick={handleBack}
                    className="mb-6 inline-flex items-center text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                </button>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">
                        Book Appointment at {facility.name}
                    </h1>

                    {/* Facility Information */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-600">
                            <strong>Address:</strong> {facility.address.street}, {facility.address.city}, {facility.address.state} {facility.address.zipCode}
                        </p>
                        <p className="text-gray-600">
                            <strong>Contact:</strong> {facility.contact.phone}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Service Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Service
                            </label>
                            <select
                                name="service"
                                value={bookingForm.service}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                required
                            >
                                <option value="">Select a service</option>
                                {availableServices.map((service, index) => (
                                    <option key={index} value={service}>
                                        {service}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Personal Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Name
                                </label>
                                <div className="mt-1 relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        name="name"
                                        value={bookingForm.name}
                                        onChange={handleInputChange}
                                        className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Phone
                                </label>
                                <div className="mt-1 relative">
                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={bookingForm.phone}
                                        onChange={handleInputChange}
                                        className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <div className="mt-1 relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="email"
                                    name="email"
                                    value={bookingForm.email}
                                    onChange={handleInputChange}
                                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        </div>

                        {/* Date and Time Selection */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Date
                                </label>
                                <div className="mt-1 relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="date"
                                        name="date"
                                        value={bookingForm.date}
                                        onChange={handleInputChange}
                                        min={today}
                                        max={maxDateString}
                                        className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Time
                                </label>
                                <div className="mt-1 relative">
                                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="time"
                                        name="time"
                                        value={bookingForm.time}
                                        onChange={handleInputChange}
                                        className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={handleBack}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                    submitting ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                {submitting ? 'Booking...' : 'Book Appointment'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BookingPage;