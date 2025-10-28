"use client";

import { use } from 'react';
import ProfileHeader from '@/components/Profile/ProfileHeader';
import ProfileSidebar from '@/components/Profile/ProfileSidebar';
import PostCard from '@/components/Post/PostCard';

export default function UserProfilePage({ params }) {
  const { username } = use(params);

  // Mock data - will be replaced with actual API call
  const user = {
    name: "Shalen Mathew",
    bio: "Hello there I am android dev sharing my knowledge to community",
    location: "Banglore, India",
    joinedDate: "Jun 20, 2024",
    email: "shalenmj@gmail.com",
    website: "https://linktr.ee/shalenmathew",
    github: "shalenmathew",
    avatar: null
  };

  const stats = {
    posts: 4,
    comments: 0,
    tags: 0
  };

  const badges = [
    { emoji: "🥚", name: "Badge 1" },
    { emoji: "📝", name: "Badge 2" }
  ];

  const skills = "Android, Kotlin, Java, Jetpack Compose, App development";
  const learning = "Android dev, Mobile dev";
  const availableFor = "Freelance work, Consultations";

  const posts = [
    {
      id: 1,
      author: "Shalen Mathew",
      date: "Oct 24",
      title: "Why I'm Building in Public (And Why You Should Too)",
      tags: ["swift", "android", "reactnative", "hacktoberfest"],
      reactionTypes: { heart: 5, party: 2, fire: 1 },
      comments: 2,
      readTime: 3,
      coverImage: null
    },
    {
      id: 2,
      author: "Shalen Mathew",
      date: "Apr 8",
      title: "A Guide to Using Singleton Design Pattern in Android",
      tags: ["designpatterns", "android", "tutorial", "learning"],
      reactionTypes: {},
      comments: 0,
      readTime: 1,
      coverImage: null
    }
  ];

  return (
    <div className="min-h-screen bg-brand-background">
      <main className="mx-16 px-3 py-4">
        <div className="max-w-[1280px] mx-auto">
          {/* Profile Header - Full Width within container */}
          <ProfileHeader user={user} />
          
          {/* Content Grid - Sidebar + Posts */}
          <div className="flex gap-6 mt-6">
            {/* Left Sidebar */}
            <div className="hidden lg:block w-80 flex-shrink-0">
              <ProfileSidebar 
                stats={stats}
                badges={badges}
                skills={skills}
                learning={learning}
                availableFor={availableFor}
              />
            </div>

            {/* Posts Section */}
            <div className="flex-1 min-w-0 space-y-2">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} showCover={false} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

