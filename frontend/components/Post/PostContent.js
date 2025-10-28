"use client";

import Link from 'next/link';
import MarkdownContent from './MarkdownContent';

export default function PostContent({ post }) {
  return (
    <article className="bg-white rounded-lg border border-brand-muted/20 overflow-hidden">
      {/* Cover Image */}
      {post.coverImage && (
        <img 
          src={post.coverImage} 
          alt={post.title}
          className="w-full h-96 object-cover"
        />
      )}

      {/* Content */}
      <div className="p-12">
        {/* Author and Date */}
        <div className="flex items-center gap-3 mb-6">
          <Link href={`/user/${post.author}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-primary-dark rounded-full flex items-center justify-center text-white text-sm font-bold hover:opacity-80 transition-opacity cursor-pointer">
              {post.author.split(' ').map(n => n[0]).join('')}
            </div>
          </Link>
          <div>
            <Link href={`/user/${post.author}`} className="font-bold text-brand-dark hover:text-brand-primary transition-colors">
              {post.author}
            </Link>
            <p className="text-sm text-brand-muted">Posted on {post.date}</p>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-5xl font-bold text-brand-dark mb-6">
          {post.title}
        </h1>

        {/* Tags */}
        <div className="flex gap-2 flex-wrap mb-8">
          {post.tags.map((tag, idx) => {
            const tagColors = [
              { bg: 'bg-yellow-50', text: 'text-yellow-700', hover: 'hover:bg-yellow-100/50' },
              { bg: 'bg-green-50', text: 'text-green-700', hover: 'hover:bg-green-100/50' },
              { bg: 'bg-blue-50', text: 'text-blue-700', hover: 'hover:bg-blue-100/50' },
            ];
            const colorIndex = idx % tagColors.length;
            const colors = tagColors[colorIndex];
            
            return (
              <Link
                key={idx}
                href={`/tag/${tag}`}
                className={`px-3 py-1.5 ${colors.bg} ${colors.text} ${colors.hover} text-sm rounded-lg cursor-pointer transition-all font-medium`}
              >
                #{tag}
              </Link>
            );
          })}
        </div>

        {/* Content Body - Markdown */}
        <div className="prose max-w-none">
          <MarkdownContent content={post.content} />
        </div>
      </div>
    </article>
  );
}

