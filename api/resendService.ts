// This service handles all interactions with the Resend API.
// The API key is stored securely here on the backend and is not exposed to the client.

// NOTE: This key is for demonstration purposes. In a real app, it would be a secret environment variable.
const RESEND_API_KEY = 're_L2L4NwEd_NysxgEaMqG6FtNK4XqTJTCfC';
const FROM_EMAIL = 'ScreenScape Reminders <onboarding@resend.dev>';

interface ShowDetails {
    showName: string;
}

interface EpisodeDetails {
    episodeName: string;
    seasonNumber: number;
    episodeNumber: number;
    overview: string;
}

const sendEmail = async (to: string, subject: string, html: string) => {
    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: FROM_EMAIL,
                to: to,
                subject: subject,
                html: html,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Resend API Error: ${errorData.message || 'Failed to send email.'}`);
        }

        const data = await response.json();
        console.log(`[Resend] Email sent successfully to ${to}. Message ID: ${data.id}`);
        return data;
    } catch (error) {
        console.error(`[Resend] Failed to send email to ${to}:`, error);
        throw error;
    }
};

export const sendConfirmationEmail = async (email: string, show: ShowDetails) => {
    const subject = `Reminder Set for ${show.showName}`;
    const html = `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
            <h2 style="color: #0074E8;">You're all set!</h2>
            <p>This email confirms that you've subscribed to new episode reminders for <strong>${show.showName}</strong>.</p>
            <p>We'll send you an email as soon as a new episode is released.</p>
            <p>Happy watching!</p>
            <p style="font-size: 0.8em; color: #777;">- The ScreenScape Team</p>
        </div>
    `;
    await sendEmail(email, subject, html);
};

export const sendNewEpisodeEmail = async (email: string, show: ShowDetails, episode: EpisodeDetails) => {
    const subject = `New Episode of ${show.showName} is Out!`;
    const html = `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
            <h2 style="color: #0074E8;">Good News! A New Episode of ${show.showName} is Available!</h2>
            <p><strong>Title:</strong> ${episode.episodeName} (S${episode.seasonNumber}E${episode.episodeNumber})</p>
            <p><strong>Overview:</strong> ${episode.overview}</p>
            <p>Enjoy the show!</p>
            <p style="font-size: 0.8em; color: #777;">- The ScreenScape Team</p>
        </div>
    `;
    await sendEmail(email, subject, html);
};