"use client";

import { use } from 'react';
import PostDetailSidebar from '@/components/Post/PostDetailSidebar';
import PostContent from '@/components/Post/PostContent';
import PostAuthorCard from '@/components/Post/PostAuthorCard';

export default function PostDetailPage({ params }) {
  const { id } = use(params);
  
  const handleReaction = (reactionType) => {
    console.log('Reaction:', reactionType);
    // API call will be implemented here
  };

  // Mock data - will be replaced with actual API call
  const post = {
    id: id,
    title: "Solving WordPress Security: What If We Just Didn't Trust Admins?",
    author: "Nick",
    date: "Oct 28",
    excerpt: "A deep dive into WordPress security and why trusting admins might not be the best approach.",
    tags: ["wordpress", "security"],
    reactionTypes: { heart: 0 },
    comments: 0,
    readTime: 5,
    coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=600&fit=crop",
    joinDate: "Jul 22, 2021",
    content: `## The Problem: Your Clients Are Why You Can't Have Nice Things

WordPress security has always been a contentious topic. While the platform itself has made great strides in improving security over the years, there's one fundamental issue that continues to plague developers: **trusting administrators**.

### Why This Matters

When you're building a WordPress site, you're essentially handing over the keys to the kingdom. Administrators have **complete control** over:

- Installing plugins (including potentially malicious ones)
- Modifying theme files
- Editing core WordPress files
- Managing user permissions
- Accessing the database

### The Real Issue

> "The weakest link in security is not the code, but the people who use it."

Here's what typically happens:

1. You build a secure, well-architected WordPress site
2. You hand it over to the client with admin access
3. They install a random plugin they found
4. The site gets compromised
5. You're called in to fix it (often for free)

### A Better Approach

What if we **didn't trust admins** by default? Here are some strategies:

#### 1. Implement Role-Based Access Control

\`\`\`php
// Restrict plugin installation
function restrict_plugin_install() {
    if (!current_user_can('administrator')) {
        remove_submenu_page('plugins.php', 'plugin-install.php');
    }
}
add_action('admin_menu', 'restrict_plugin_install');
\`\`\`

#### 2. Use a Whitelist for Plugins

Only allow installation from a pre-approved list of plugins.

#### 3. Implement Code Review

Before any plugin or theme update, have it reviewed by your security team.

### Conclusion

Security isn't just about writing secure code—it's about **controlling access** and **limiting potential damage**. By implementing these strategies, you can build WordPress sites that remain secure even when handed over to less technical clients.

**Key Takeaways:**
- Don't trust admin users blindly
- Implement strict access controls
- Use plugin whitelists
- Regular security audits are essential

---

*What are your thoughts on WordPress security? Share in the comments below!*`
  };

  const totalReactions = Object.values(post.reactionTypes).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-brand-background">
      <main className="mx-16 px-3 py-4">
        <div className="flex gap-6">
          {/* Left Sidebar - Reactions */}
          <div className="hidden lg:block">
            <PostDetailSidebar 
              reactions={totalReactions} 
              comments={post.comments}
              onReact={handleReaction}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <PostContent post={post} />
          </div>

          {/* Right Sidebar - Author & Trending */}
          <div className="hidden xl:block w-80 flex-shrink-0 space-y-4">
            <PostAuthorCard 
              author={post.author}
              joinDate={post.joinDate}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

