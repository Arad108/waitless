// src/app/welcome/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../AuthContext';
import DashboardNav from '../DashboardNav';
import { 
    Calendar, 
    Clock, 
    MapPin, 
    Bell, 
    Users, 
    Utensils, 
    Heart, 
    Sparkles, 
    Dumbbell, 
    GraduationCap, 
    Briefcase, 
    Car, 
    Home, 
    Cat, 
    GamepadIcon, 
    ChevronDown,
    RefreshCw,
    type LucideIcon 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { Appointment } from '../types/appointment';

interface Category {
    title: string;
    description: string;
    image: string;
    icon: LucideIcon;
    color: string;
    buttonColor: string;
    path: string;
}

// Categories array
const categories: Category[] = [
    {
        title: "Food & Dining",
        description: "Reserve tables at restaurants, cafes, and more",
        image: "https://img.freepik.com/premium-vector/fast-food-illustration-table-food-drink-illustration-burger-chocolate-ice_527873-40.jpg",
        icon: Utensils,
        color: "bg-amber-100",
        buttonColor: "bg-amber-600",
        path: "/business/food"
    },
    {
        title: "Healthcare",
        description: "Book appointments with doctors and medical services",
        image: "https://i.graphicmama.com/blog/wp-content/uploads/2021/04/13081639/free-medical-illustrations-02.png",
        icon: Heart,
        color: "bg-blue-100",
        buttonColor: "bg-blue-600",
        path: "/welcome/business/health"
    },
    {
        title: "Beauty & Wellness",
        description: "Schedule spa treatments and salon services",
        image: "https://c8.alamy.com/comp/2PWXJ1T/spa-beauty-wellness-massage-salon-nail-technicians-doing-pedicure-for-female-client-woman-having-nail-polish-female-character-sitting-on-chair-and-2PWXJ1T.jpg",
        icon: Sparkles,
        color: "bg-pink-100",
        buttonColor: "bg-pink-600",
        path: "/business/beauty"
    },
    {
        title: "Fitness",
        description: "Book sessions with gyms, trainers, and yoga studios",
        image: "https://img.freepik.com/free-vector/gym-concept-illustration_114360-6870.jpg",
        icon: Dumbbell,
        color: "bg-green-100",
        buttonColor: "bg-green-600",
        path: "/business/fitness"
    },
    {
        title: "Education",
        description: "Schedule tutoring and learning sessions",
        image: "https://media.istockphoto.com/id/1392001982/vector/man-and-woman-studying-together.jpg?s=612x612&w=0&k=20&c=IhP7Yc_71W4hYArcyT5Bdy3rzOLNVRHAtcfc_N2a0zs=",
        icon: GraduationCap,
        color: "bg-purple-100",
        buttonColor: "bg-purple-600",
        path: "/business/education"
    },
    {
        title: "Professional Services",
        description: "Book consultations with professionals",
        image: "https://img.freepik.com/premium-vector/professional-financial-advisor-bank-consultant-providing-expert-help-consulting-services_1322560-2719.jpg",
        icon: Briefcase,
        color: "bg-indigo-100",
        buttonColor: "bg-indigo-600",
        path: "/business/professional"
    },
    {
        title: "Auto Services",
        description: "Schedule car maintenance and repairs",
        image: "https://cdni.iconscout.com/illustration/premium/thumb/auto-service-list-illustration-download-in-svg-png-gif-file-formats--check-car-pack-vehicle-illustrations-4453452.png?f=webp",
        icon: Car,
        color: "bg-red-100",
        buttonColor: "bg-red-600",
        path: "/business/auto"
    },
    {
        title: "Home Services",
        description: "Book home maintenance and repairs",
        image: "https://img.freepik.com/premium-vector/home-cleaning-service-house-illustration-domestic-cleaner-cartoon-job-hygiene-housekeeping-work-concept-professional-people-with-mop-broom-equipment-household-dust_109722-2093.jpg",
        icon: Home,
        color: "bg-orange-100",
        buttonColor: "bg-orange-600",
        path: "/business/home"
    },
    {
        title: "Pet Services",
        description: "Schedule pet care and grooming",
        image: "https://media.istockphoto.com/id/1331985239/vector/people-with-pets.jpg?s=612x612&w=0&k=20&c=aK7_DFTBx5rD5IEAbU8GyJj6jcwSi5Wuef8vU_-lC88=",
        icon: Cat,
        color: "bg-teal-100",
        buttonColor: "bg-teal-600",
        path: "/business/pets"
    },
    {
        title: "Gaming",
        description: "Book gaming sessions and tournaments",
        image: "https://img.freepik.com/free-vector/gaming-setup-illustration_23-2148897021.jpg",
        icon: GamepadIcon,
        color: "bg-violet-100",
        buttonColor: "bg-violet-600",
        path: "/welcome/business/gaming"
    }
];
const WelcomePage = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [showAllCategories, setShowAllCategories] = useState<boolean>(false);
  const router = useRouter();

  const displayedCategories = showAllCategories ? categories : categories.slice(0, 9);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Check authentication
    if (!user) {
      router.push('/login');
      return;
    }

    fetchUpcomingAppointments();

    // Add auto-refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      fetchUpcomingAppointments(true); // true means silent refresh
    }, 30000);

    return () => {
      clearInterval(timer);
      clearInterval(refreshInterval);
    };
  }, [user, router]);

  const fetchUpcomingAppointments = async (silent = false) => {
    try {
      if (!silent) {
        setRefreshing(true);
      }
      
      const response = await fetch('http://localhost:5000/api/appointments/upcoming', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }

      const data = await response.json();
      
      if (data.data && Array.isArray(data.data)) {
        const processedAppointments = data.data.map((appointment: any) => {
          return {
            _id: appointment._id,
            businessId: {
              _id: appointment.businessId?._id || appointment.businessId,
              name: appointment.businessId?.name || 'Unknown Business',
              address: appointment.businessId?.address || 'No address provided',
              contact: appointment.businessId?.contact || {}
            },
            service: {
              name: appointment.service?.name || appointment.serviceId?.name || 'Unknown Service',
              duration: appointment.service?.duration || 60,
              price: appointment.service?.price || 0
            },
            appointmentTime: appointment.appointmentTime,
            appointmentEndTime: appointment.appointmentEndTime,
            status: appointment.status,
            customerDetails: appointment.customerDetails || {
              name: appointment.customerName,
              email: appointment.customerEmail,
              phone: appointment.customerPhone
            }
          };
        });
        
        setUpcomingAppointments(processedAppointments);
      } else {
        setUpcomingAppointments([]);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      if (!silent) {
        toast.error('Failed to load appointments');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error logging out');
    }
  };

  const handleRefresh = () => {
    fetchUpcomingAppointments();
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to cancel appointment');
      }

      toast.success('Appointment cancelled successfully');
      fetchUpcomingAppointments();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error('Failed to cancel appointment');
    }
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
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-6 mb-8 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Welcome back, {user?.full_name}!
            </h1>
            <p className="text-lg opacity-90">
              Ready to manage your appointments and discover local services?
            </p>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Time Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <Clock className="w-8 h-8 text-blue-600 mb-2" />
            <p className="text-2xl font-semibold">
              {currentTime.toLocaleTimeString()}
            </p>
            <p className="text-gray-600">Local Time</p>
          </div>
          
          {/* Upcoming Appointments */}
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <Calendar className="w-8 h-8 text-purple-600 mb-2" />
            <p className="text-2xl font-semibold">
              {upcomingAppointments.length}
            </p>
            <p className="text-gray-600">Upcoming Appointments</p>
          </div>
          
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <Bell className="w-8 h-8 text-green-600 mb-2" />
            <button 
              onClick={() => router.push('/welcome/business/health')}
              className="text-green-600 hover:text-green-700 font-semibold"
            >
              Book New Appointment
            </button>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {displayedCategories.map((category, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer"
              onClick={() => router.push(category.path)}
            >
              <div className="relative h-48">
                <img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-white p-2 rounded-full">
                  <category.icon className="w-6 h-6 text-gray-600" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{category.title}</h3>
                <p className="text-gray-600 mb-4">{category.description}</p>
                <button
                  className={`w-full py-2 px-4 rounded-lg text-white ${category.buttonColor} hover:opacity-90 transition-opacity`}
                >
                  Explore Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Show More/Less Button */}
        {categories.length > 9 && (
          <div className="text-center mb-8">
            <button
              onClick={() => setShowAllCategories(!showAllCategories)}
              className="inline-flex items-center px-6 py-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
            >
              <span>{showAllCategories ? 'Show Less' : 'Show More'}</span>
              <ChevronDown className={`ml-2 w-5 h-5 transform transition-transform ${showAllCategories ? 'rotate-180' : ''}`} />
            </button>
          </div>
        )}

        {/* Upcoming Appointments Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Upcoming Appointments</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={() => router.push('/appointments')}
                className="text-blue-600 hover:text-blue-700"
              >
                View All
              </button>
            </div>
          </div>
          
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div 
                  key={appointment._id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {appointment.businessId.name}
                      </h3>
                      <p className="text-gray-600">
                        Service: {appointment.service.name}
                      </p>
                      <p className="text-gray-600">
                        Date: {new Date(appointment.appointmentTime).toLocaleString()}
                      </p>
                      <div className="flex items-center mt-2">
                        <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-600">
                          {appointment.businessId.address || 'Address unavailable'}
                        </span>
                      </div>
                      {appointment.businessId.contact?.phone && (
                        <p className="text-sm text-gray-600 mt-1">
                          Phone: {appointment.businessId.contact.phone}
                        </p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      appointment.status === 'confirmed' || appointment.status === 'scheduled'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    <button 
                      onClick={() => router.push(`/appointments/${appointment._id}`)}
                      className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    >
                      View Details
                    </button>
                    {(appointment.status === 'pending' || appointment.status === 'scheduled') && (
                      <button 
                        onClick={() => handleCancelAppointment(appointment._id)}
                        className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No upcoming appointments
            </p>
          )}
        </div>

        {/* Logout Section */}
        <div className="text-center">
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </main>
    </div>
  );
};

export default WelcomePage;