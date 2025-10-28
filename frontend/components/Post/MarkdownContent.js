"use client";

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

export default function MarkdownContent({ content }) {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={{
        // Heading styles
        h1: ({ node, ...props }) => (
          <h1 className="text-4xl font-bold text-brand-dark mt-8 mb-4" {...props} />
        ),
        h2: ({ node, ...props }) => (
          <h2 className="text-3xl font-bold text-brand-dark mt-8 mb-4" {...props} />
        ),
        h3: ({ node, ...props }) => (
          <h3 className="text-2xl font-bold text-brand-dark mt-6 mb-3" {...props} />
        ),
        h4: ({ node, ...props }) => (
          <h4 className="text-xl font-bold text-brand-dark mt-6 mb-3" {...props} />
        ),
        h5: ({ node, ...props }) => (
          <h5 className="text-lg font-bold text-brand-dark mt-4 mb-2" {...props} />
        ),
        h6: ({ node, ...props }) => (
          <h6 className="text-base font-bold text-brand-dark mt-4 mb-2" {...props} />
        ),
        
        // Paragraph
        p: ({ node, ...props }) => (
          <p className="text-lg text-brand-dark leading-relaxed mb-4" {...props} />
        ),
        
        // Links
        a: ({ node, ...props }) => (
          <a 
            className="text-brand-primary hover:text-brand-primary-dark underline transition-colors" 
            target="_blank"
            rel="noopener noreferrer"
            {...props} 
          />
        ),
        
        // Lists
        ul: ({ node, ...props }) => (
          <ul className="list-disc list-inside text-lg text-brand-dark mb-4 ml-4 space-y-2" {...props} />
        ),
        ol: ({ node, ...props }) => (
          <ol className="list-decimal list-inside text-lg text-brand-dark mb-4 ml-4 space-y-2" {...props} />
        ),
        li: ({ node, ...props }) => (
          <li className="text-lg text-brand-dark" {...props} />
        ),
        
        // Code blocks
        code: ({ node, inline, ...props }) => {
          if (inline) {
            return (
              <code 
                className="bg-gray-100 text-red-600 px-1.5 py-0.5 rounded text-sm font-mono" 
                {...props} 
              />
            );
          }
          return (
            <code 
              className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono mb-4" 
              {...props} 
            />
          );
        },
        pre: ({ node, ...props }) => (
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4" {...props} />
        ),
        
        // Blockquote
        blockquote: ({ node, ...props }) => (
          <blockquote 
            className="border-l-4 border-brand-primary pl-4 py-2 italic text-brand-muted bg-brand-background my-4" 
            {...props} 
          />
        ),
        
        // Images
        img: ({ node, ...props }) => (
          <img 
            className="rounded-lg my-4 max-w-full h-auto" 
            {...props} 
          />
        ),
        
        // Horizontal rule
        hr: ({ node, ...props }) => (
          <hr className="border-t border-brand-muted/30 my-8" {...props} />
        ),
        
        // Tables
        table: ({ node, ...props }) => (
          <div className="overflow-x-auto my-4">
            <table className="min-w-full border border-brand-muted/30" {...props} />
          </div>
        ),
        thead: ({ node, ...props }) => (
          <thead className="bg-brand-background" {...props} />
        ),
        th: ({ node, ...props }) => (
          <th className="border border-brand-muted/30 px-4 py-2 text-left font-bold text-brand-dark" {...props} />
        ),
        td: ({ node, ...props }) => (
          <td className="border border-brand-muted/30 px-4 py-2 text-brand-dark" {...props} />
        ),
        
        // Strong and emphasis
        strong: ({ node, ...props }) => (
          <strong className="font-bold text-brand-dark" {...props} />
        ),
        em: ({ node, ...props }) => (
          <em className="italic" {...props} />
        ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

