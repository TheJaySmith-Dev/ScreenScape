export interface Change {
    type: 'feature' | 'fix' | 'improvement';
    description: string;
}

export interface Version {
    version: string;
    date: string;
    changes: Change[];
}

export const changelog: Version[] = [
    {
        version: '1.0.0',
        date: '2025-09-19',
        changes: [
            { type: 'feature', description: 'AI-powered Award Search: Find award-winning movies through a conversational interface.' },
            { type: 'feature', description: 'Curated Hubs: Explore content from specific Brands, Studios, Networks, and Streaming Providers.' },
            { type: 'feature', description: 'Personalized "For You" Recommendations: Get AI-curated carousels based on your liked items.' },
            { type: 'feature', description: 'Interactive Games: Discover movies in a fun way with games like "Higher or Lower".' },
            { type: 'feature', description: 'Rich Media Details: View cast, crew, trailers, and AI-generated "Fun Facts" for any movie.' },
            { type: 'feature', description: 'Version History: Keep track of new features and updates in the "MyScape" page.' },
            { type: 'improvement', description: 'Polished UI with "liquid glass" effects and smooth animations.' },
        ],
    },
];
