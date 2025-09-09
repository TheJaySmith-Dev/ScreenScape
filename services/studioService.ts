import type { Studio } from '../types.ts';

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export const popularStudios: Studio[] = [
  { 
    id: 2, 
    name: 'Walt Disney Pictures', 
    logoUrl: 'https://cdn.brandfetch.io/idxASqzkm_/theme/light/logo.svg?c=1dxbfHSJFAPEGdCLU4o5B',
    bgColor: '#0A193C',
    hoverGifUrl: 'https://media.giphy.com/media/C669q14vk6dsG7M449/giphy.gif'
  },
  { 
    id: 3, 
    name: 'Pixar', 
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/40/Pixar_logo.svg',
    forceWhiteLogo: true,
    sizeClass: 'max-w-[70%] max-h-[50%]'
  },
  { 
    id: 174, 
    name: 'Warner Bros. Pictures', 
    logoUrl: 'https://cdn.brandfetch.io/idTzC5o569/theme/light/logo.svg?c=1dxbfHSJFAPEGdCLU4o5B',
    bgColor: '#0078D6',
    hoverGifUrl: 'https://media.giphy.com/media/ysMoXTcHzU5hGQT8Bi/giphy.gif',
    sizeClass: 'max-w-[40%] max-h-[25%]'
  },
  { 
    id: 33, 
    name: 'Universal Pictures', 
    logoUrl: `${TMDB_IMAGE_BASE_URL}/8lvHyhjr8oUKOOy2dKXoALWKdp0.png`, 
    forceWhiteLogo: true,
    hoverGifUrl: 'https://media.giphy.com/media/UuhvGRnxF4ror9cEJZ/giphy.gif',
    bgColor: '#CB7EBE'
  },
  { 
    id: 4, 
    name: 'Paramount', 
    logoUrl: 'https://cdn.brandfetch.io/idrAEeTLeo/theme/light/logo.svg?c=1dxbfHSJFAPEGdCLU4o5B',
    bgColor: '#0064FF',
    hoverGifUrl: 'https://media.giphy.com/media/56wSAVRGOw3VfAnWlQ/giphy.gif'
  },
  { 
    id: 1, 
    name: 'Lucasfilm Ltd.', 
    logoUrl: `${TMDB_IMAGE_BASE_URL}/o86DbpburjxrqAzEDhXZcyE8pDb.png`, 
    forceWhiteLogo: true,
    bgColor: '#EC9126',
    hoverGifUrl: 'https://media.giphy.com/media/qQLpsRfyGRJPRqe7CS/giphy.gif'
  },
  { 
    id: 5, 
    name: 'Columbia Pictures', 
    logoUrl: `${TMDB_IMAGE_BASE_URL}/71BqEFAF4V3qjjMPCpLuyJFB9A.png`, 
    forceWhiteLogo: true,
    bgColor: '#C4D8E2',
    hoverGifUrl: 'https://media.giphy.com/media/HgKmjmVp0nBjX3Snhk/giphy.gif'
  },
  { 
    id: 521, 
    name: 'DreamWorks Animation', 
    logoUrl: 'https://cdn.brandfetch.io/idj7QnEvUG/theme/dark/logo.svg?c=1dxbfHSJFAPEGdCLU4o5B', 
    forceWhiteLogo: true,
    bgColor: '#222222',
    hoverGifUrl: 'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExNnFhazJhZW5zeTA1OWpqaWM3bGg1dnYybG43ZGpnbHhvOThhdDYyMiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/kvYl8HkoCnNPd6bHgv/giphy.gif'
  },
  { 
    id: 41077, 
    name: 'A24', 
    logoUrl: 'https://cdn.brandfetch.io/idHlMmIC6s/theme/dark/logo.svg?c=1dxbfHSJFAPEGdCLU4o5B',
    bgColor: '#B0E9AC',
    hoverGifUrl: 'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExZXljd3d5cm1zaDE2Zm9kMnd6OWRtOGZ2NGJqNTJwejl0dTVsazQwbiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/qEkgMT8W6cGoqxmx2y/giphy.gif'
  },
  { 
    id: 127928, 
    name: '20th Century Studios', 
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/08/20th_Century_Studios_%282021%29.svg',
    bgColor: '#666666',
    hoverGifUrl: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExOGFrdHI4Y3A0aG8zdTd0NGhhdHNncmwyMWNtMWhtZzJsa29rOTQ5eiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ynCHdWYZsY2tAgvvhr/giphy.gif',
    forceWhiteLogo: true
  },
  { 
    id: 8411, 
    name: 'MGM', 
    logoUrl: 'https://cdn.brandfetch.io/idLI5gJfl8/w/161/h/86/theme/dark/logo.png?c=1bxid64Mup7aczewSAYMX&t=1667810266726',
    bgColor: '#D4AE36',
    hoverGifUrl: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExNDAxeDR6eGRteXQwYTdvdWw1ZjFubjhvMWJuaGZsdzBoaGN6azVkdCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/PZfAdZzYByppxJ4uMi/giphy.gif',
  },
];