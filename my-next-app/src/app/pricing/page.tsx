"use client"; // Add this at the top

import React from 'react';
import { CheckCircle } from 'lucide-react';

// Define types for the props
interface PricingCardProps {
  title: string;
  price: string;
  features: string[];
  delay: number;
}

const Pricing = () => {
  return (
    <section className="mx-auto px-4 py-16 min-h-screen w-full bg-white">
      <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
        Pricing Plans
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <PricingCard
          title="Basic"
          price="$10"
          features={[
            "Real-time Queue Tracking",
            "Basic Analytics",
            "Email Support",
          ]}
          delay={200} // milliseconds delay
        />
        <PricingCard
          title="Pro"
          price="$30"
          features={[
            "Advanced Queue Management",
            "Priority Analytics",
            "24/7 Support",
          ]}
          delay={350}
        />
        <PricingCard
          title="Enterprise"
          price="Contact Us"
          features={[
            "Customized Queue Solutions",
            "In-depth Analytics",
            "Dedicated Support Team",
          ]}
          delay={500}
        />
      </div>
    </section>
  );
};

// Apply the interface to the PricingCard component
const PricingCard: React.FC<PricingCardProps> = ({ title, price, features, delay }) => (
  <div
    className={`p-8 bg-white rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-shadow transform opacity-0 animate-fade-in`}
    style={{ animationDelay: `${delay}ms` }}
  >
    <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">{title}</h3>
    <p className="text-4xl font-extrabold text-blue-600 text-center mb-6">{price}</p>
    <ul className="space-y-3 mb-6">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center text-gray-600">
          <CheckCircle className="text-blue-500 mr-2" size={20} />
          {feature}
        </li>
      ))}
    </ul>
    <button className="bg-blue-600 text-white w-full py-3 rounded-lg hover:bg-blue-700 transition-colors">
      Choose Plan
    </button>
  </div>
);

export default Pricing;
