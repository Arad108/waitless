import React from 'react';
import Link from 'next/link';

const Navigation = () => {
  return (
    <nav className="flex flex-wrap justify-between items-center mb-16 w-full">
      <div className="text-2xl font-bold text-blue-600">WaitLess</div>
      <div className="flex flex-wrap items-center space-x-4 md:space-x-6">
        <Link href="/features" className="text-gray-600 hover:text-blue-600">
          Features
        </Link>
        <Link href="/login" className="text-gray-600 hover:text-blue-600">
          Login
        </Link>
        <Link href="/pricing" className="text-gray-600 hover:text-blue-600">
          Pricing
        </Link>
        <Link 
          href="/register" 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Register
        </Link>
      </div>
    </nav>
  );
};

export default Navigation;