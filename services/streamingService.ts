import type { StreamingProviderInfo } from '../types.ts';

// Logos from TMDb with w500 size
export const supportedProviders: StreamingProviderInfo[] = [
  {
    id: 8,
    key: 'netflix',
    name: 'Netflix',
    logoUrl: 'https://image.tmdb.org/t/p/w500/p64T1dD1s6I1s3s2eR2x61zT0bA.jpg',
    bgColor: '#141414'
  },
  {
    id: 337,
    key: 'disney',
    name: 'Disney+',
    logoUrl: 'https://image.tmdb.org/t/p/w500/dgPSo2h2cozZf7b6x4B5s3g4H2A.jpg',
    bgColor: '#0A193C'
  },
  {
    id: 9,
    key: 'prime',
    name: 'Prime Video',
    logoUrl: 'https://image.tmdb.org/t/p/w500/dQeAar5H991dsB4hM5jSAnjhI6.jpg',
    bgColor: '#00A8E1'
  },
];
