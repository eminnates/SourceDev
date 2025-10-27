"use client";

import DiscussionItem from './DiscussionItem';

export default function DiscussSection() {
  const discussions = [
    {
      id: 2,
      title: "My creation🦉 Elf Owl AI — The Little AI That Could (and Sometimes Couldn't)",
      comments: 1
    },
    {
      id: 3,
      title: "What was your win this week!?",
      comments: 14
    },
    {
      id: 4,
      title: "FlowOps: The Human-AI Workflow Conductor",
      badge: "New",
      badgeColor: "bg-yellow-400 text-yellow-900"
    },
    {
      id: 5,
      title: "AutoSage: Self-Evolving Workflows",
      badgeColor: "bg-yellow-400 text-yellow-900",
      badge: "New",
    },
    {
      id: 6,
      title: "ChronoMind: Solving AI Forgetfulness",
      badgeColor: "bg-yellow-400 text-yellow-900",
      comments: 3
    }
  ];

  return (
    <div className="bg-white rounded-lg border border-brand-muted/20 p-4">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-brand-dark mb-1">#discuss</h3>
        <p className="text-sm text-brand-muted">Discussion threads targeting the whole community</p>
      </div>

      <div className="divide-y divide-brand-muted/20">
        {discussions.map((item) => (
          <DiscussionItem
            key={item.id}
            id={item.id}
            title={item.title}
            tag={item.tag}
            tagColor={item.tagColor}
            description={item.description}
            badge={item.badge}
            badgeColor={item.badgeColor}
            comments={item.comments}
          />
        ))}
      </div>
    </div>
  );
}

