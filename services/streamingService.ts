
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
    logoUrl: 'https://platform.theverge.com/wp-content/uploads/sites/2/chorus/uploads/chorus_asset/file/25357066/Disney__Logo_March_2024.png?quality=90&strip=all&crop=7.8125%2C0%2C84.375%2C100&w=750',
    bgColor: '#0A193C',
    hoverGifUrl: 'https://media.giphy.com/media/C669q14vk6dsG7M449/giphy.gif',
  },
  {
    id: 9,
    key: 'prime',
    name: 'Prime Video',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Prime_Video_logo.svg',
    bgColor: '#00A8E1',
    hoverGifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExN3ZzOHp4eGg2NThnYXgyOW96d2RnbW13MnFuN2kzcTFwZWdxbmxsbiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/9J1rsK6c84wsQ2r5sA/giphy.gif'
  },
  {
    id: 1899,
    key: 'max',
    name: 'HBO Max',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/17/HBO_Max_Logo.svg',
    bgColor: '#3E008D',
    hoverGifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZ3N0a2l4bHljYjU2dWNuaGhyNjJ0b2NtcXVpODN1OTZzcjVjZ2xidCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o72F5tx9CEdwAwg12/giphy.gif'
  },
];
