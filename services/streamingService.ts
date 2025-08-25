import type { StreamingProviderInfo } from '../types.ts';

// Logos from TMDb with w500 size
export const supportedProviders: StreamingProviderInfo[] = [
  {
    id: 8,
    key: 'netflix',
    name: 'Netflix',
    logoUrl: 'https://cdn.brandfetch.io/ideQwN5lBE/theme/light/logo.svg?c=1dxbfHSJFAPEGdCLU4o5B',
    bgColor: '#000000',
    hoverGifUrl: 'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDYyeXgzMmszYmM5b200ZTFmNjE3eG5zNThhcGQ2NDd6YnUxOWdkdSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/c69RGBBRK8SKwMO78n/giphy.gif'
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