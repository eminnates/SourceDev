"use client";

import { BsFileText, BsChatDots, BsHash, BsPeople, BsPersonCheck } from 'react-icons/bs';

export default function ProfileSidebar({ badges, skills, learning, availableFor, stats, followersCount, followingCount }) {
  return (
    <div className="space-y-4">
      {/* Stats Card */}
      {stats && (
        <div className="bg-white rounded-lg border border-brand-muted/20 p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <BsFileText className="w-6 h-6 text-gray-500" />
              <span className="text-brand-dark">
                <strong className="font-semibold">{stats.posts}</strong> posts published
              </span>
            </div>

            <div className="flex items-center gap-3">
              <BsPeople className="w-6 h-6 text-gray-500" />
              <span className="text-brand-dark">
                <strong className="font-semibold">{followersCount || 0}</strong> followers
              </span>
            </div>

            <div className="flex items-center gap-3">
              <BsPersonCheck className="w-6 h-6 text-gray-500" />
              <span className="text-brand-dark">
                <strong className="font-semibold">{followingCount || 0}</strong> following
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Skills/Languages */}
      {skills && (
        <div className="bg-white rounded-lg border border-brand-muted/20 p-6">
          <h3 className="text-lg font-bold text-brand-dark mb-3">Skills/Languages</h3>
          <p className="text-brand-muted">{skills}</p>
        </div>
      )}

      {/* Currently Learning */}
      {learning && (
        <div className="bg-white rounded-lg border border-brand-muted/20 p-6">
          <h3 className="text-lg font-bold text-brand-dark mb-3">Currently learning</h3>
          <p className="text-brand-muted">{learning}</p>
        </div>
      )}

      {/* Available For */}
      {availableFor && (
        <div className="bg-white rounded-lg border border-brand-muted/20 p-6">
          <h3 className="text-lg font-bold text-brand-dark mb-3">Available for</h3>
          <p className="text-brand-muted">{availableFor}</p>
        </div>
      )}
    </div>
  );
}

