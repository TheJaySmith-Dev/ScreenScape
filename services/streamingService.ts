
import type { StreamingProviderInfo } from '../types.ts';

// Logos from TMDb with w500 size
export const supportedProviders: StreamingProviderInfo[] = [
  {
    id: 8,
    key: 'netflix',
    name: 'Netflix',
    logoUrl: 'https://images.ctfassets.net/y2ske730sjqp/1aONibCke6niZhgPxuiilC/2c401b05a07288746ddf3bd3943fbc76/BrandAssets_Logos_01-Wordmark.jpg?w=940',
    bgColor: '#000000',
    hoverGifUrl: 'https://media.giphy.com/media/c69RGBBRK8SKwMO78n/giphy.gif',
    borderColor: '#E50914',
    edgeToEdge: true,
  },
  {
    id: 337,
    key: 'disney',
    name: 'Disney+',
    logoUrl: 'https://lumiere-a.akamaihd.net/v1/images/disney_logo_march_2024_050fef2e.png?region=0%2C0%2C1920%2C1080',
    bgColor: '#0A193C',
    hoverGifUrl: 'https://lumiere-a.akamaihd.net/v1/images/disney_logo_animation_march_2024_27a0dafe.gif',
    borderColor: '#258792',
    edgeToEdge: true,
  },
  {
    id: 9,
    key: 'prime',
    name: 'Prime Video',
    logoUrl: 'https://asset.brandfetch.io/idvZo_bHzX/id3bA7Abq6.svg',
    bgColor: '#0F79AF',
    hoverGifUrl: 'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExN2o0NnR6MXRhMmV6eTFiN2dpejF6aTE1bXFvZnJmMWJ4dDY4dHljZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/gvfw1b9opaAFgOTBDI/giphy.gif',
    borderColor: '#0F171E',
  },
  {
    id: 1899,
    key: 'max',
    name: 'HBO Max',
    logoUrl: 'https://www.hbomaxpartners.com/_next/static/media/HBO-Max-Iridescent.2d4d755b.png',
    bgColor: '#000000',
    hoverGifUrl: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExdjBhNmxhbTc3Y295d2R2dzU0cXdmODhkYjVsMjZydTVjdWx4dGlnbyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/wzK2hDKussGKwa7CiB/giphy.gif',
    borderColor: '#FFFFFF',
  },
  {
    id: 531,
    key: 'paramount',
    name: 'Paramount+',
    logoUrl: 'https://cdn.brandfetch.io/idU9biO3N_/w/276/h/172/theme/light/logo.png?c=1bxid64Mup7aczewSAYMX&t=1722978265002',
    bgColor: '#0059F1',
    hoverGifUrl: 'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExZXN4NWZkZzB5MzRwOXI5YmY1dGhpa3JrbHFkMHQ5ZzRnbDlpNzVmbyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/alfSqlC9s7wdqDAOZY/giphy.gif',
    borderColor: '#FFFFFF',
  },
];