"use client";
import React from 'react';
import Link from 'next/link';

const DashboardNav = () => {
  return (
    <nav className="flex flex-wrap justify-between items-center mb-16 w-full">
      <div className="text-2xl font-bold text-blue-600">WaitLess</div>
      <div className="flex flex-wrap items-center space-x-4 md:space-x-6">
        <Link href="/dashboard" className="text-gray-600 hover:text-blue-600">
          Dashboard
        </Link>
      </div>
    </nav>
  );
};

export default DashboardNav;