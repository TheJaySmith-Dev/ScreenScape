import React, { useState, useEffect } from 'react';

// The target launch date, set in UTC for universal consistency.
const LAUNCH_DATE = new Date('2024-08-01T00:00:00Z');

const calculateTimeLeft = () => {
    // The difference will be correct for any timezone because `new Date()` is timezone-aware.
    const difference = +LAUNCH_DATE - +new Date();
    let timeLeft: TimeLeft = {};

    if (difference > 0) {
        timeLeft = {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60)
        };
    }

    return timeLeft;
};

interface TimeLeft {
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
}

const TimeUnit: React.FC<{ value: number; label: string }> = ({ value, label }) => (
    <div className="flex flex-col items-center">
        <span className="text-4xl md:text-6xl font-bold text-white tracking-wider tabular-nums">
            {String(value).padStart(2, '0')}
        </span>
        <span className="text-sm md:text-base text-gray-400 uppercase tracking-widest">{label}</span>
    </div>
);

export const CountdownTimer: React.FC = () => {
    const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const timerComponents = [
        timeLeft.days !== undefined && <TimeUnit key="days" value={timeLeft.days} label="Days" />,
        timeLeft.hours !== undefined && <TimeUnit key="hours" value={timeLeft.hours} label="Hours" />,
        timeLeft.minutes !== undefined && <TimeUnit key="minutes" value={timeLeft.minutes} label="Minutes" />,
        timeLeft.seconds !== undefined && <TimeUnit key="seconds" value={timeLeft.seconds} label="Seconds" />,
    ].filter(Boolean);


    return (
        <div className="text-center text-gray-400 fade-in p-8 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 w-full max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 text-white">Collections Feature Launching Soon!</h2>
            <p className="mb-8 max-w-xl mx-auto">We're putting the finishing touches on a brand new way to explore your favorite movie franchises and cinematic universes.</p>
            {timerComponents.length > 0 ? (
                <div className="flex justify-center items-center gap-4 md:gap-8">
                    {timerComponents}
                </div>
            ) : (
                <span className="text-2xl font-bold text-green-400 animate-pulse">It's Here! Check back soon.</span>
            )}
        </div>
    );
};
