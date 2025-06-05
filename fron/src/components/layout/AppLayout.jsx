import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import Header from './Header';

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-lg mx-auto pb-20 pt-16">
        <Outlet />
      </main>
      <Navigation />
    </div>
  );
};

export default AppLayout; 