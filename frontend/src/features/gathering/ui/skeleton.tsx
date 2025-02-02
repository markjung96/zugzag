// features/gathering/ui/GatheringLoadingSkeleton.tsx
import React from 'react';

export const GatheringLoadingSkeleton: React.FC = () => (
  <div className="space-y-4 animate-pulse">
    {/* Calendar Skeleton */}
    <div className="h-96 bg-muted rounded-lg" />

    {/* Divider Skeleton */}
    <div className="h-4 w-24 mx-auto bg-muted rounded" />

    {/* Meeting List Skeletons */}
    {[...Array(3)].map((_, i) => (
      <div key={i} className="rounded-lg border border-border bg-card">
        {/* Date Header Skeleton */}
        <div className="px-4 py-2 border-b border-border bg-muted">
          <div className="h-6 w-32 bg-background rounded" />
        </div>

        {/* Meeting Items Skeleton */}
        <div className="p-2 space-y-2">
          {[...Array(2)].map((_, j) => (
            <div key={j} className="p-3 rounded-md bg-background border border-border">
              <div className="space-y-3">
                <div className="h-5 w-3/4 bg-muted rounded" />
                <div className="space-y-2">
                  <div className="h-4 w-1/4 bg-muted rounded" />
                  <div className="h-4 w-1/3 bg-muted rounded" />
                  <div className="h-4 w-1/2 bg-muted rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);
