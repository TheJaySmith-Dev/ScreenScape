import { useState, useEffect } from 'react';

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isFinished: boolean;
}

const calculateTimeLeft = (targetDate: Date): TimeLeft => {
    const difference = +targetDate - +new Date();
    
    if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isFinished: true };
    }

    return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isFinished: false,
    };
};


export const useCountdown = (targetDateString: string | undefined): TimeLeft => {
    const targetDate = new Date(targetDateString || '');
    const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft(targetDate));

    useEffect(() => {
        if (!targetDateString || isNaN(targetDate.getTime())) {
            setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isFinished: true });
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft(targetDate));
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDateString, targetDate]);

    return timeLeft;
};