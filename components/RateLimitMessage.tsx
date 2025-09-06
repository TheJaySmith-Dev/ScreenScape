import React from 'react';
import { useCountdown } from '../hooks/useCountdown.ts';

interface RateLimitMessageProps {
    resetTime: number;
    featureName: string;
}

const TimeUnit: React.FC<{ value: number; label: string }> = ({ value, label }) => (
    <div className="flex flex-col items-center countdown-time-unit">
        <span className="text-2xl font-bold tabular-nums">
            {String(value).padStart(2, '0')}
        </span>
        <span className="text-xs uppercase">{label}</span>
    </div>
);

export const RateLimitMessage: React.FC<RateLimitMessageProps> = ({ resetTime, featureName }) => {
    const { hours, minutes, seconds, isFinished } = useCountdown(new Date(resetTime).toISOString());

    if (isFinished) {
        return (
            <div className="text-center p-4 bg-green-500/10 border border-green-500/20 text-green-300 rounded-lg w-full">
                <p className="font-semibold">Daily limit has been reset!</p>
                <p className="text-sm">You can now use {featureName}. Please refresh the page.</p>
            </div>
        )
    }

    return (
        <div className="text-center p-4 bg-red-500/10 border border-red-500/20 text-red-300 rounded-lg w-full">
            <p className="font-semibold">Daily AI Request Limit Reached</p>
            <p className="text-sm mb-4">You can use {featureName} again in:</p>
            <div className="flex justify-center items-center gap-4">
                <TimeUnit value={hours} label="Hours" />
                <TimeUnit value={minutes} label="Mins" />
                <TimeUnit value={seconds} label="Secs" />
            </div>
        </div>
    );
};
