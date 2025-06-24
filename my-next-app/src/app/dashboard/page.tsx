"use client";
import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Calendar, Store, User, RotateCcw, Bell, Sparkles, ChevronRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface Booking {
    _id: string;
    facilityId: {
        name: string;
        address: {
            street: string;
            city: string;
            state: string;
        };
    };
    service: string;
    date: string;
    time: string;
    status: string;
    name: string;
    phone: string;
    email: string;
}

const Dashboard = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
    const router = useRouter();

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/bookings/user', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch bookings');
            }

            const data = await response.json();
            if (data.status === 'success') {
                setBookings(data.data);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
            toast.error('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const handleNewBooking = () => {
        router.push('/welcome/business/health');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-4">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    if (!bookings.length) {
        return (
            <div className="min-h-screen bg-gray-50 p-4">
                <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8 text-center">
                    <div className="mb-6">
                        <Calendar className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">No Appointments Scheduled</h2>
                        <p className="text-gray-600 mb-6">Book your next appointment and skip the wait!</p>
                    </div>
                    <button
                        onClick={handleNewBooking}
                        className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                    >
                        Book an Appointment
                    </button>
                </div>
            </div>
        );
    }

    // Separate upcoming and past bookings
    const currentDate = new Date();
    const upcomingBookings = bookings.filter(booking => new Date(`${booking.date}T${booking.time}`) > currentDate);
    const pastBookings = bookings.filter(booking => new Date(`${booking.date}T${booking.time}`) <= currentDate);

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            {/* Header Section */}
            <header className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">My Appointments</h1>
                        <p className="text-gray-600">Manage your healthcare appointments</p>
                    </div>
                    <button
                        onClick={handleNewBooking}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-colors"
                    >
                        <Calendar className="h-4 w-4" />
                        New Booking
                    </button>
                </div>
            </header>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
                <div className="border-b">
                    <div className="flex">
                        <button
                            className={`px-6 py-3 text-sm font-medium ${
                                activeTab === 'upcoming'
                                    ? 'border-b-2 border-blue-500 text-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                            onClick={() => setActiveTab('upcoming')}
                        >
                            Upcoming ({upcomingBookings.length})
                        </button>
                        <button
                            className={`px-6 py-3 text-sm font-medium ${
                                activeTab === 'past'
                                    ? 'border-b-2 border-blue-500 text-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                            onClick={() => setActiveTab('past')}
                        >
                            Past ({pastBookings.length})
                        </button>
                    </div>
                </div>

                {/* Bookings List */}
                <div className="p-6">
                    <div className="space-y-4">
                        {(activeTab === 'upcoming' ? upcomingBookings : pastBookings).map((booking) => (
                            <div
                                key={booking._id}
                                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-lg">{booking.facilityId.name}</h3>
                                        <p className="text-gray-600">{booking.service}</p>
                                        <div className="flex items-center mt-2 text-sm text-gray-500">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            {new Date(booking.date).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })} at {booking.time}
                                        </div>
                                        <div className="flex items-center mt-1 text-sm text-gray-500">
                                            <MapPin className="h-4 w-4 mr-2" />
                                            {booking.facilityId.address.street}, {booking.facilityId.address.city}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`inline-block px-3 py-1 rounded-full ${
                                            booking.status === 'confirmed'
                                                ? 'bg-green-100 text-green-800'
                                                : booking.status === 'pending'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-gray-100 text-gray-800'
                                        } text-sm`}>
                                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;