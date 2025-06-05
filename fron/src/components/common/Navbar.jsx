import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <div className="bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-8 w-auto">
              {/* Logo */}
            </div>
            <div className="ml-10 flex items-baseline space-x-4">
              <Link to="/trending" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Trending
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar; 