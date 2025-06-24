"use client"; // Add this at the top

import React from 'react'
import LandingPage from './landingpage';
import QueueList from './QueueList';

const page = () => {
  return (
    <div>
      <LandingPage/>
      <QueueList/>
    </div>
  )
}

export default function Home() {
  return <LandingPage />
}
