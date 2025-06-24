"use client";

import React from 'react';
import { Clock, Calendar, MapPin, Star, ArrowRight, Building2, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import Navigation from './navigation';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="p-8 bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 opacity-0 animate-fadeIn">
    <div className="inline-flex items-center justify-center w-12 h-12 mb-6 bg-blue-100 text-blue-600 rounded-lg">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);

interface BenefitCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const BenefitCard: React.FC<BenefitCardProps> = ({ icon, title, description }) => (
  <div className="p-8 text-center bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 opacity-0 animate-fadeIn">
    <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-gradient-to-br from-blue-100 to-purple-100 text-blue-600 rounded-full">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);

const LandingPage: React.FC = () => {
  return (
    <div className="relative w-full overflow-x-hidden bg-gradient-to-b from-white via-blue-50 to-white">
      {/* Hero Section */}
      <header className="relative w-full max-w-[100vw] px-4 pt-8 pb-16 animate-slideUp">
        <div className="container mx-auto">
          <Navigation />

          <div className="flex flex-col items-center text-center mt-16 relative">
            {/* Background Decoration */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden">
              <div className="absolute top-0 left-0 w-64 h-64 bg-blue-100 rounded-full filter blur-3xl opacity-20 -translate-x-1/2"></div>
              <div className="absolute top-20 right-0 w-72 h-72 bg-purple-100 rounded-full filter blur-3xl opacity-20 translate-x-1/2"></div>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-8 relative animate-scaleIn">
              Queue Management
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Made Simple
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-2xl leading-relaxed animate-fadeIn">
              Transform your business with real-time queue updates, smart booking features, and valuable customer insights.
            </p>

            {/* Value Propositions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mt-8 w-full max-w-4xl">
              <div className="p-6 bg-white/80 backdrop-blur-lg rounded-xl shadow-lg animate-fadeIn delay-200">
                <h4 className="text-xl font-bold text-blue-600 mb-2">Smart Booking</h4>
                <p className="text-gray-600">Streamline your appointment system</p>
              </div>
              <div className="p-6 bg-white/80 backdrop-blur-lg rounded-xl shadow-lg animate-fadeIn delay-300">
                <h4 className="text-xl font-bold text-blue-600 mb-2">Real-Time Updates</h4>
                <p className="text-gray-600">Keep customers informed instantly</p>
              </div>
              <div className="p-6 bg-white/80 backdrop-blur-lg rounded-xl shadow-lg animate-fadeIn delay-400">
                <h4 className="text-xl font-bold text-blue-600 mb-2">Analytics</h4>
                <p className="text-gray-600">Make data-driven decisions</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="relative w-full px-4 py-16">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-white/50 -z-10"></div>
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-16 opacity-0 animate-fadeIn">
            Core Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            <FeatureCard 
              icon={<Clock className="w-6 h-6" />} 
              title="Real-time Queue Tracking" 
              description="Keep customers informed with live wait time updates and smart notifications" 
            />
            <FeatureCard 
              icon={<Calendar className="w-6 h-6" />} 
              title="Easy Booking" 
              description="Simple appointment scheduling with automated reminders" 
            />
            <FeatureCard 
              icon={<MapPin className="w-6 h-6" />} 
              title="Location Services" 
              description="Integrated maps to help customers find nearby businesses" 
            />
            <FeatureCard 
              icon={<Star className="w-6 h-6" />} 
              title="User Reviews" 
              description="Build trust with authentic customer feedback and ratings" 
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative w-full py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-50"></div>
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-16 opacity-0 animate-fadeIn">
            Why Choose WaitLess?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            <BenefitCard 
              icon={<Building2 className="w-8 h-8" />} 
              title="Perfect for Small Businesses" 
              description="Designed for small to mid-scale professionals like doctors, salons, and gyms" 
            />
            <BenefitCard 
              icon={<Users className="w-8 h-8" />} 
              title="Improved Customer Experience" 
              description="Reduce wait times and keep customers satisfied with transparent queue management" 
            />
            <BenefitCard 
              icon={<TrendingUp className="w-8 h-8" />} 
              title="Business Analytics" 
              description="Gain valuable insights into customer behavior and optimize your operations" 
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative w-full px-4 py-16">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white shadow-xl">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Start your free trial today. No credit card required.
            </p>
            <button 
              className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors duration-300 shadow-lg hover:scale-105 active:scale-95 transform"
            >
              Get Started Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;