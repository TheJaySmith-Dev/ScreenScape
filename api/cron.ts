// This is the handler for the GET /api/cron endpoint.
// In a production environment, this endpoint would be configured to be called
// automatically by a scheduler (like Vercel Cron Jobs) once a day.

import { db } from './db.ts';
import { fetchTvShowDetails } from '../services/mediaService.ts';
import { sendNewEpisodeEmail } from './resendService.ts';

export default async (req: Request): Promise<Response> => {
    try {
        console.log('[CRON] Starting daily episode check...');
        const subscriptions = await db.getAllSubscriptions();
        let notificationsSent = 0;

        for (const sub of subscriptions) {
            try {
                const showDetails = await fetchTvShowDetails(sub.showId);
                const latestEpisode = showDetails.last_episode_to_air;

                // Check if there is a new episode since the last check
                if (latestEpisode && latestEpisode.id !== sub.lastEpisodeId) {
                    console.log(`[CRON] New episode found for "${sub.showName}" for user ${sub.email}.`);
                    
                    await sendNewEpisodeEmail(
                        sub.email,
                        { showName: sub.showName },
                        {
                            episodeName: latestEpisode.name,
                            seasonNumber: latestEpisode.season_number,
                            episodeNumber: latestEpisode.episode_number,
                            overview: latestEpisode.overview,
                        }
                    );

                    // Update the subscription in the database with the new episode ID
                    await db.updateSubscription(sub.email, sub.showId, {
                        lastEpisodeId: latestEpisode.id,
                    });

                    notificationsSent++;
                }
            } catch (error) {
                console.error(`[CRON] Error processing subscription for show ID ${sub.showId} for user ${sub.email}:`, error);
            }
        }

        const message = `[CRON] Daily episode check finished. Sent ${notificationsSent} notifications.`;
        console.log(message);
        return new Response(JSON.stringify({ message }), { status: 200 });

    } catch (error: any) {
        console.error('[CRON] A critical error occurred during the cron job:', error);
        return new Response(JSON.stringify({ message: 'Cron job failed', error: error.message }), { status: 500 });
    }
};