"use client";

import { BsThreeDots } from 'react-icons/bs';
import { FaGithub, FaEnvelope, FaLink, FaMapMarkerAlt, FaBirthdayCake } from 'react-icons/fa';

export default function ProfileHeader({ user }) {
  return (
    <div className="bg-white rounded-lg border border-brand-muted/20 relative">
      {/* Cover Background - Black */}
      <div className="h-24 bg-black rounded-t-lg"></div>
      
      {/* Profile Content */}
      <div className="px-8 pb-6 relative">
        {/* Avatar - Centered and overlapping */}
        <div className="flex justify-center">
          <div className="relative -mt-16">
            <div className="w-32 h-32 rounded-full border-4 border-black bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
          </div>
        </div>

        {/* Follow Button - Top Right */}
        <div className="absolute top-6 right-8 flex gap-2">
          <button className="px-6 py-2 bg-brand-primary hover:bg-brand-primary-dark text-white font-bold rounded-lg transition-colors">
            Follow
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <BsThreeDots className="w-6 h-6 text-brand-dark" />
          </button>
        </div>

        {/* Name and Bio - Centered */}
        <div className="text-center mt-4 mb-6">
          <h1 className="text-3xl font-bold text-brand-dark mb-2">{user.name}</h1>
          <p className="text-brand-muted text-base">{user.bio}</p>
        </div>

        {/* Info Row - Centered */}
        <div className="flex items-center justify-center gap-6 text-sm text-brand-muted flex-wrap">
          {user.location && (
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="w-4 h-4 text-gray-500" />
              <span>{user.location}</span>
            </div>
          )}
          
          {user.joinedDate && (
            <div className="flex items-center gap-2">
              <FaBirthdayCake className="w-4 h-4 text-gray-500" />
              <span>Joined on {user.joinedDate}</span>
            </div>
          )}
          
          {user.email && (
            <div className="flex items-center gap-2">
              <FaEnvelope className="w-4 h-4 text-gray-500" />
              <span>{user.email}</span>
            </div>
          )}
          
          {user.website && (
            <div className="flex items-center gap-2">
              <FaLink className="w-4 h-4 text-gray-500" />
              <a href={user.website} target="_blank" rel="noopener noreferrer" className="hover:text-brand-primary transition-colors">
                {user.website.replace('https://', '')}
              </a>
            </div>
          )}
          
          {user.github && (
            <div className="flex items-center gap-2">
              <FaGithub className="w-4 h-4 text-gray-500" />
              <a href={`https://github.com/${user.github}`} target="_blank" rel="noopener noreferrer" className="hover:text-brand-primary transition-colors">
                <FaGithub className="w-5 h-5" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

