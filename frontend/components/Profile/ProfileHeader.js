"use client";

import { useState, useEffect } from 'react';
import { BsThreeDots } from 'react-icons/bs';
import { FaGithub, FaEnvelope, FaLink, FaMapMarkerAlt, FaBirthdayCake } from 'react-icons/fa';
import { isAuthenticated, getUser as getCurrentUser } from '@/utils/auth';
import { useRouter } from 'next/navigation';
import { followUser, unfollowUser, checkIfFollowing } from '@/utils/api/followApi';

export default function ProfileHeader({ user, onFollowChange }) {
  const router = useRouter();
  const currentUser = getCurrentUser();
  const isOwnProfile = currentUser && (currentUser.username === user.username || currentUser.id === user.id);

  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Backend uses both camelCase (UserDto) and snake_case (User entity)
  const displayName = user.displayName || user.display_name || user.name || user.username;
  const profileImage = user.profileImageUrl || user.profile_img_url;
  const createdDate = user.createdAt || user.created_at;
  const userEmail = user.email || '';

  // Check follow status when component mounts
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (isOwnProfile || !isAuthenticated()) return;

      try {
        const result = await checkIfFollowing(user.id);
        if (result.success) {
          setIsFollowing(result.isFollowing);
        }
      } catch (error) {
        console.error('Failed to check follow status:', error);
      }
    };

    checkFollowStatus();
  }, [user.id, isOwnProfile]);

  const handleEditProfile = () => {
    router.push('/settings');
  };

  const handleFollow = async () => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    if (isOwnProfile) return;

    setFollowLoading(true);
    try {
      let result;
      if (isFollowing) {
        result = await unfollowUser(user.id);
      } else {
        result = await followUser(user.id);
      }

      if (result.success) {
        setIsFollowing(!isFollowing);
        // Notify parent component about follow change
        if (onFollowChange) {
          onFollowChange(!isFollowing);
        }
      } else {
        console.error('Follow action failed:', result.message);
      }
    } catch (error) {
      console.error('Follow action error:', error);
    } finally {
      setFollowLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg border border-brand-muted/20">
      {/* Cover Background - Black */}
      <div className="h-24 bg-black rounded-t-lg"></div>
      
      {/* Profile Content */}
      <div className="px-4 sm:px-8 pb-6">
        {/* Avatar - Centered and overlapping */}
        <div className="flex justify-center">
          <div className="relative -mt-16">
            {profileImage ? (
              <img 
                src={profileImage}
                alt={displayName}
                className="w-32 h-32 rounded-full border-4 border-black object-cover shadow-lg"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=1ABC9C&color=fff&bold=true&size=128`;
                }}
              />
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-black bg-brand-primary flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                {displayName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex justify-center gap-2">
          {isOwnProfile ? (
            <button 
              onClick={handleEditProfile}
              className="px-6 py-2 bg-brand-primary hover:bg-brand-primary-dark text-white font-bold rounded-lg transition-colors"
            >
              Edit Profile
            </button>
          ) : (
            <button
              onClick={handleFollow}
              disabled={followLoading}
              className={`px-6 py-2 font-bold rounded-lg transition-colors ${
                isFollowing
                  ? 'bg-gray-200 hover:bg-gray-300 text-gray-800 border border-gray-300'
                  : 'bg-brand-primary hover:bg-brand-primary-dark text-white'
              } ${followLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {followLoading ? 'Loading...' : (isFollowing ? 'Following' : 'Follow')}
            </button>
          )}
        </div>

        {/* Name and Bio - Centered */}
        <div className="text-center mt-4 mb-6">
          <h1 className="text-3xl font-bold text-brand-dark mb-2">{displayName}</h1>
          {user.bio && <p className="text-brand-muted text-base">{user.bio}</p>}
        </div>

        {/* Info Row - Centered */}
        <div className="flex items-center justify-center gap-6 text-sm text-brand-muted flex-wrap">
          {user.location && (
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="w-4 h-4 text-gray-500" />
              <span>{user.location}</span>
            </div>
          )}
          
          {createdDate && (
            <div className="flex items-center gap-2">
              <FaBirthdayCake className="w-4 h-4 text-gray-500" />
              <span>Joined on {new Date(createdDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          )}
          
          {userEmail && (
            <div className="flex items-center gap-2">
              <FaEnvelope className="w-4 h-4 text-gray-500" />
              <span>{userEmail}</span>
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
          
          {(user.githubUrl || user.github_url) && (
            <div className="flex items-center gap-2">
              <a href={user.githubUrl || user.github_url} target="_blank" rel="noopener noreferrer" className="hover:text-brand-primary transition-colors">
                <FaGithub className="w-5 h-5" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

