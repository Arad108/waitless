"use client";

import React, { useState, useEffect } from 'react';
import { Clock, Calendar, MapPin, Star, Users, Bell, Sparkles, ChevronDown, Play, Pause } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const waitTimeData = [
  { name: 'Mon', value: 5 },
  { name: 'Tue', value: 4 },
  { name: 'Wed', value: 6 },
  { name: 'Thu', value: 3 },
  { name: 'Fri', value: 7 },
  { name: 'Sat', value: 8 },
  { name: 'Sun', value: 4 },
];

const Features = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('realtime');
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Animated background pattern
  const AnimatedBackground = () => (
    <div className="absolute inset-0 overflow-hidden opacity-20">
      <div className="relative w-full h-full">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute bg-blue-500 rounded-full opacity-20"
            style={{
              width: `${Math.random() * 20 + 10}px`,
              height: `${Math.random() * 20 + 10}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 10 + 5}s linear infinite`
            }}
          />
        ))}
      </div>
    </div>
  );

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-12 bg-gray-200 rounded w-3/4 mx-auto"/>
          <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto"/>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"/>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <AnimatedBackground />
        <div className="relative z-10 text-center max-w-4xl mx-auto p-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Experience Queue Management Reimagined
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-12">
            Streamline your business operations with intelligent scheduling
          </p>
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="bg-white/90 hover:bg-white text-gray-800 rounded-full p-4 shadow-lg transition-all hover:scale-105"
          >
            {isPlaying ? <Pause className="w-6 h-6"/> : <Play className="w-6 h-6"/>}
          </button>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-5 min-h-[600px]">
            {/* Sidebar */}
            <div className="lg:col-span-2 bg-gray-50 p-6 space-y-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-8">
                Experience the Features
              </h2>
              
              <button
                onClick={() => setActiveTab('realtime')}
                className={`w-full text-left p-4 rounded-lg transition-all ${
                  activeTab === 'realtime' 
                    ? 'bg-blue-100 text-blue-900' 
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6"/>
                  <div>
                    <h3 className="font-semibold">Real-time Tracking</h3>
                    <p className="text-sm text-gray-600">Live wait time updates</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('booking')}
                className={`w-full text-left p-4 rounded-lg transition-all ${
                  activeTab === 'booking' 
                    ? 'bg-blue-100 text-blue-900' 
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-6 h-6"/>
                  <div>
                    <h3 className="font-semibold">Smart Booking</h3>
                    <p className="text-sm text-gray-600">AI-powered scheduling</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`w-full text-left p-4 rounded-lg transition-all ${
                  activeTab === 'analytics' 
                    ? 'bg-blue-100 text-blue-900' 
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6"/>
                  <div>
                    <h3 className="font-semibold">Analytics</h3>
                    <p className="text-sm text-gray-600">Customer insights</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 p-6">
              {activeTab === 'realtime' && (
                <div className="h-full flex flex-col">
                  <h3 className="text-xl font-bold mb-6">Wait Time Trends</h3>
                  <div className="flex-1 min-h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={waitTimeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          dot={{ fill: '#3b82f6' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold">Average Wait</h4>
                      <p className="text-2xl font-bold text-blue-600">5.2 min</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold">Served Today</h4>
                      <p className="text-2xl font-bold text-green-600">127</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold">Satisfaction</h4>
                      <p className="text-2xl font-bold text-purple-600">98%</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'booking' && (
                <div className="h-full flex flex-col">
                  <h3 className="text-xl font-bold mb-6">Smart Scheduling</h3>
                  <div className="grid grid-cols-2 gap-4 flex-1">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div 
                        key={i}
                        className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center"
                      >
                        <p className="text-gray-500 text-center">
                          Available Slot {i + 1}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-yellow-500"/>
                      AI Recommendation
                    </h4>
                    <p className="text-sm text-gray-600">
                      Based on historical data, booking slots between 2-4 PM have the shortest wait times.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'analytics' && (
                <div className="h-full flex flex-col">
                  <h3 className="text-xl font-bold mb-6">Customer Analytics</h3>
                  <div className="grid grid-cols-2 gap-6 flex-1">
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold">Peak Hours</h4>
                        <div className="mt-2 space-y-2">
                          {['12 PM - 1 PM', '5 PM - 6 PM'].map((time, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${80 - i * 20}%` }}/>
                              <span className="text-sm text-gray-600">{time}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold">Customer Satisfaction</h4>
                        <div className="flex items-center gap-1 mt-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              className="w-5 h-5" 
                              fill={star <= 4 ? "#fbbf24" : "none"}
                              stroke={star <= 4 ? "#fbbf24" : "#d1d5db"}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-4">Recent Activity</h4>
                      <div className="space-y-4">
                        {[
                          { text: "New booking received", icon: Calendar },
                          { text: "Customer checked in", icon: Users },
                          { text: "Wait time updated", icon: Clock }
                        ].map((activity, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <activity.icon className="w-5 h-5 text-blue-500"/>
                            <span className="text-sm text-gray-600">{activity.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Clock,
              title: "Real-time Updates",
              description: "Keep customers informed with accurate wait times and instant notifications"
            },
            {
              icon: Calendar,
              title: "Smart Scheduling",
              description: "AI-powered booking system that learns and adapts to your business patterns"
            },
            {
              icon: Bell,
              title: "Instant Notifications",
              description: "Automated alerts for customers and staff to streamline communication"
            },
            {
              icon: Users,
              title: "Customer Management",
              description: "Comprehensive tools to manage customer relationships and preferences"
            },
            {
              icon: MapPin,
              title: "Location Services",
              description: "Help customers find you and manage multiple locations efficiently"
            },
            {
              icon: Star,
              title: "Reviews & Feedback",
              description: "Build trust with verified customer reviews and ratings"
            }
          ].map((feature, i) => (
            <div 
              key={i}
              className="bg-white rounded-xl shadow-lg p-6 transform transition-all hover:scale-105"
            >
              <feature.icon className="w-12 h-12 text-blue-500 mb-4"/>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Features;