"use client";
import * as React from "react";
import { cn } from "../lib/utils";
import { UserAvatar } from "../components/avatar";

export interface ActivityEvent {
  id: string;
  timestamp: string | Date;
  actor: string;
  action: string;
  entity: string;
  entityType?: string;
}

interface ActivityFeedProps {
  events: ActivityEvent[];
  maxItems?: number;
  className?: string;
}

function formatRelativeTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function ActivityFeed({ events, maxItems = 20, className }: ActivityFeedProps) {
  const visible = events.slice(0, maxItems);

  if (visible.length === 0) {
    return (
      <div className={cn("py-6 text-center text-sm text-text-muted", className)}>
        No recent activity.
      </div>
    );
  }

  return (
    <div className={cn("space-y-0 divide-y divide-border", className)}>
      {visible.map((event) => (
        <div key={event.id} className="flex items-start gap-2.5 py-2.5">
          <UserAvatar name={event.actor} size="sm" className="mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-text-primary leading-snug">
              <span className="font-medium">{event.actor}</span>{" "}
              <span className="text-text-secondary">{event.action}</span>{" "}
              <span className="font-medium">{event.entity}</span>
            </p>
            <p className="text-xs text-text-muted mt-0.5">
              {formatRelativeTime(event.timestamp)}
              {event.entityType && (
                <span className="ml-1.5 opacity-60">· {event.entityType}</span>
              )}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export { ActivityFeed };
