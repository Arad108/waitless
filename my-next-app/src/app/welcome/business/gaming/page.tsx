// src/app/business/gaming/page.tsx
'use client';

import React, { useState } from 'react';
import DashboardNav from '../../../DashboardNav';
import { Star, Clock, MapPin, Phone, Filter } from 'lucide-react';

interface GamingBusiness {
  id: string;
  name: string;
  description: string;
  rating: number;
  address: string;
  phone: string;
  openingHours: string;
  images: string[];
  features: string[];
  priceRange: string;
  category: string[];
}

const gamingBusinesses: GamingBusiness[] = [
  {
    id: '1',
    name: 'House of Pool',
    description: 'Premier pool and billiards venue with professional tables and equipment. Perfect for both casual players and serious enthusiasts.',
    rating: 4.5,
    address: '123 Gaming Street, City Name',
    phone: '+1 234-567-8900',
    openingHours: '12:00 PM - 12:00 AM',
    images: ['/api/placeholder/600/400'],
    features: ['Pool Tables', 'Snooker', 'Bar', 'Tournament Space'],
    priceRange: '$$',
    category: ['Pool', 'Billiards', 'Sports']
  },

  
  // Add more gaming businesses here
];

const GamingBusinessesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const categories = ['all', 'Pool', 'Arcade', 'ESports', 'Board Games', 'VR Gaming'];

  const filteredBusinesses = gamingBusinesses.filter(business => {
    const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         business.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || business.category.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />
      
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Gaming Venues Near You</h1>
          
          {/* Search and Filter Section */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search gaming venues..."
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                    selectedCategory === category
                      ? 'bg-violet-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Gaming Businesses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBusinesses.map((business) => (
            <div key={business.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              {/* Business Image */}
              <div className="relative h-48">
                <img
                  src={business.images[0]}
                  alt={business.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded-lg shadow">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-semibold">{business.rating}</span>
                  </div>
                </div>
              </div>

              {/* Business Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{business.name}</h3>
                <p className="text-gray-600 mb-4">{business.description}</p>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{business.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{business.openingHours}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{business.phone}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {business.features.map((feature, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-violet-100 text-violet-700 rounded-full text-sm"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                <button className="w-full mt-4 bg-violet-600 text-white py-2 rounded-lg hover:bg-violet-700 transition-colors">
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GamingBusinessesPage;