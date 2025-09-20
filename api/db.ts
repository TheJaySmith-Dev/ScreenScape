// This is a mock in-memory database to simulate a real database for the reminder feature.
// In a production environment, this would be replaced with a persistent database like Firestore, DynamoDB, or a relational DB.

export interface Subscription {
    email: string;
    showId: number;
    showName: string;
    lastEpisodeId: number | null;
    lastNotified: Date;
}

// Using a Map to ensure unique subscriptions per email per show
const subscriptions = new Map<string, Subscription>();

export const db = {
    addSubscription: async (sub: Subscription): Promise<void> => {
        const key = `${sub.email}:${sub.showId}`;
        subscriptions.set(key, sub);
        console.log(`[DB] Added/Updated subscription for ${sub.email} to ${sub.showName}`);
    },

    getSubscription: async (email: string, showId: number): Promise<Subscription | undefined> => {
        const key = `${email}:${showId}`;
        return subscriptions.get(key);
    },

    getAllSubscriptions: async (): Promise<Subscription[]> => {
        return Array.from(subscriptions.values());
    },

    updateSubscription: async (email: string, showId: number, updates: Partial<Subscription>): Promise<void> => {
        const key = `${email}:${showId}`;
        const existing = subscriptions.get(key);
        if (existing) {
            const updated = { ...existing, ...updates, lastNotified: new Date() };
            subscriptions.set(key, updated);
            console.log(`[DB] Updated subscription for ${email} to ${updated.showName}. New last episode ID: ${updated.lastEpisodeId}`);
        }
    }
};