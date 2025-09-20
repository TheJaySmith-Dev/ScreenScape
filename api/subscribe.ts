// This is the handler for the POST /api/subscribe endpoint.
import { fetchTvShowDetails } from '../services/mediaService.ts';
import { db } from './db.ts';
import { sendConfirmationEmail } from './resendService.ts';

// This is a mock serverless function handler.
// In a real environment (like Vercel or Netlify), this file would be automatically
// mapped to the /api/subscribe route.
export default async (req: Request): Promise<Response> => {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ message: 'Method Not Allowed' }), { status: 405 });
    }

    try {
        const { email, showId } = await req.json();

        if (!email || !showId) {
            return new Response(JSON.stringify({ message: 'Email and showId are required' }), { status: 400 });
        }

        // Fetch latest show details from TMDb to get the current last episode
        const showDetails = await fetchTvShowDetails(showId);
        if (!showDetails) {
            return new Response(JSON.stringify({ message: 'TV show not found' }), { status: 404 });
        }

        const lastEpisode = showDetails.last_episode_to_air;

        const subscription = {
            email,
            showId,
            showName: showDetails.name,
            lastEpisodeId: lastEpisode ? lastEpisode.id : null,
            lastNotified: new Date(),
        };

        // Save the subscription to our database
        await db.addSubscription(subscription);

        // Send a confirmation email
        await sendConfirmationEmail(email, { showName: showDetails.name });

        return new Response(JSON.stringify({ message: 'Subscription successful! A confirmation email has been sent.' }), { status: 200 });

    } catch (error: any) {
        console.error('[API Subscribe Error]', error);
        return new Response(JSON.stringify({ message: error.message || 'An internal server error occurred.' }), { status: 500 });
    }
};