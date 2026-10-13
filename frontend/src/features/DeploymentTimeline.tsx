import React from 'react';
import { DeploymentEvent } from '../types';
import { CheckCircle2, AlertCircle, Clock, ArrowRight } from 'lucide-react';

interface DeploymentTimelineProps {
  events: DeploymentEvent[];
  isLoading?: boolean;
}

export const DeploymentTimeline: React.FC<DeploymentTimelineProps> = ({ events, isLoading }) => {
  if (isLoading) {
    return (
      <div className="py-6 text-center text-xs font-mono text-ink-faint animate-pulse">
        Loading deployment events telemetry...
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="py-6 text-center text-xs font-mono text-ink-faint">
        No event records logged for this deployment.
      </div>
    );
  }

  return (
    <div className="space-y-4 font-mono text-xs">
      {events.map((event, idx) => {
        const isSuccess = event.eventType.includes('SUCCEEDED') || event.eventType.includes('PASSED');
        const isError = event.eventType.includes('FAILED') || event.eventType.includes('ERROR');

        return (
          <div key={event.id || idx} className="flex items-start gap-3 border-l-2 border-ink pl-4 py-1 relative">
            <div className={`absolute -left-[7px] top-2 w-3 h-3 rounded-full border border-ink ${
              isError ? 'bg-red-600' : isSuccess ? 'bg-green-600' : 'bg-lime'
            }`} />
            <div className="flex-1">
              <div className="flex items-center justify-between text-[11px] text-ink-faint mb-1">
                <span className="font-bold text-ink uppercase tracking-wider">
                  [{event.eventType}]
                </span>
                <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
              </div>
              <p className="text-ink text-xs bg-paper-light p-2.5 border border-stone-subtle">
                {event.message}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
