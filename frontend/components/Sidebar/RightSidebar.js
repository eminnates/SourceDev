'use client';

import React from 'react';
import Link from 'next/link';

export default function RightSidebar() {
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
        <aside className="w-80 flex-shrink-0 space-y-4">

            <div className="bg-white rounded-lg border border-brand-muted/20 p-4">
                <div className="mb-4">
                    <h3 className="text-lg font-bold text-brand-dark mb-1">#discuss</h3>
                    <p className="text-sm text-brand-muted">Discussion threads targeting the whole community</p>
                </div>

                <div className="divide-y divide-brand-muted/20">
                    {discussions.map((item) => (
                        <div key={item.id} className="group py-4 first:pt-0 last:pb-0">
                            <Link href={`/post/${item.id}`}>
                                {/* Tag if exists */}
                                {item.tag && (
                                    <div className="mb-2">
                                        <span className={`px-2 py-1 ${item.tagColor} text-xs rounded font-medium`}>
                                            {item.tag}
                                        </span>
                                        {item.description && (
                                            <p className="text-xs text-brand-muted mt-1">{item.description}</p>
                                        )}
                                    </div>
                                )}

                                {/* Title */}
                                <h4 className="text-base font-medium text-brand-dark group-hover:text-brand-primary transition-colors mb-1">
                                    {item.title}
                                </h4>

                                {/* Badge or Comments */}
                                {item.badge ? (
                                    <span className={`inline-block px-2 py-1 ${item.badgeColor} text-xs font-bold rounded`}>
                                        {item.badge}
                                    </span>
                                ) : item.comments !== undefined && (
                                    <p className="text-xs text-brand-muted">
                                        {item.comments} {item.comments === 1 ? 'comment' : 'comments'}
                                    </p>
                                )}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

        </aside>
    );
}

