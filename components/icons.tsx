import React from 'react';

type IconProps = {
  className?: string;
};

export const SearchIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

export const CloseIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export const StarIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

export const PlayIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
    </svg>
);

export const GlobeIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
);

export const TicketIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-1.5h5.25m-5.25 0h3m-3 0h-1.5m2.14-9.36c.218-.315.484-.606.784-.86M16.5 18a4.5 4.5 0 0 0-1.88-3.593l-3.41-2.274a1.125 1.125 0 0 1 0-1.932l3.41-2.274A4.5 4.5 0 0 0 16.5 6.002Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 6v12M6 6h.008v.008H6V6Zm0 3h.008v.008H6V9Zm0 3h.008v.008H6v-.008Zm0 3h.008v.008H6v-.008Zm0 3h.008v.008H6v-.008Z" />
    </svg>
);

export const VisionIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
    </svg>
);

export const UserIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
);

export const TvIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-1.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25A2.25 2.25 0 0 1 5.25 3h13.5A2.25 2.25 0 0 1 21 5.25Z" />
    </svg>
);

export const ThumbsUpIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L5 16.764V8.27c0-.355.286-.64.64-.64h4.36c.354 0 .64.285.64.64v3.27z" />
    </svg>
);

export const ThumbsDownIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.738 3h4.017c.163 0 .326.02.485.06L17 5.764V15.27c0 .355-.286.64-.64.64h-4.36c-.354 0-.64-.285-.64-.64v-3.27z" />
    </svg>
);

export const PlaySolidIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M6.3 2.841A1.5 1.5 0 0 0 4 4.11V15.89a1.5 1.5 0 0 0 2.3 1.269l9.344-5.89a1.5 1.5 0 0 0 0-2.538L6.3 2.84Z" />
    </svg>
);

export const PauseIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M5.75 3a.75.75 0 0 0-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 0 0 .75-.75V3.75a.75.75 0 0 0-.75-.75h-1.5ZM12.75 3a.75.75 0 0 0-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 0 0 .75-.75V3.75a.75.75 0 0 0-.75-.75h-1.5Z" />
    </svg>
);

export const VolumeUpIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
    </svg>
);

export const VolumeOffIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6.375a9 9 0 0 1 12.728 0M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
    </svg>
);

export const FullScreenEnterIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75v4.5m0-4.5h-4.5m4.5 0L15 9M20.25 20.25v-4.5m0 4.5h-4.5m4.5 0L15 15" />
    </svg>
);

export const FullScreenExitIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9V4.5M15 9h4.5M15 9l5.25-5.25M15 15v4.5M15 15h4.5M15 15l5.25 5.25" />
    </svg>
);

export const ImdbIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className={className} fill="currentColor">
        <path d="M44,40.12H4V12.88H44ZM46,10.88H2V42.12H46Z"/><path d="M7.3,17.17v1.7h1.4v9.85H7.3V30.42H5.9V17.17Zm6,0v11.55h1.83l.21-1.3a2.38,2.38,0,0,1,2.16,1.48,3.54,3.54,0,0,0,3.38,1.86,4.6,4.6,0,0,0,4.86-4.9c0-3.3-2.19-5.11-4.71-5.11a2.8,2.8,0,0,0-2.61,1.59,2.83,2.83,0,0,1-.18-1.28V17.17Zm5.94,6.48a2.53,2.53,0,0,1,2.67-2.73c1.61,0,2.64,1.21,2.64,2.73s-1,2.79-2.64,2.79A2.56,2.56,0,0,1,19.24,23.65ZM31,17.17,29.61,25l-1.42-7.82H26.51l1.83,11.55h1.59l1.42-7.79,1.42,7.79H34.3l1.83-11.55Zm7,0v9.85h1.4v1.7h-4.2v-1.7h1.4V17.17Z"/>
    </svg>
);

export const RottenTomatoesIcon: React.FC<IconProps> = ({ className }) => (
    <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NTUiIGhlaWdodD0iNDU1IiB2aWV3Qm94PSIwIDAgMzQxLjI1IDM0MS4yNSI+PHBhdGggZmlsbD0iI2ZhMzIwYSIgZD0iTTEyOS41IDIyMWMtMy0xLTMtMTQtMy0xNHMyLTE2IDEyLTIwYzEwLTUgMjEtOCAyMS04cy01IDEzLTExIDE3Yy02IDQtMTkgMTEtMTkgMjV6Ii8+PHBhdGggZmlsbD0iI2ZhMzIwYSIgZD0iTTIyNS41IDEzMGMtMi0yLTEyLTUtMTItNXMtMiAxNSA SAxOWMzIDQgMTUgNiAxNSA2czQtMTUtNS0yMHoiLz48cGF0aCBmaWxsPSIjZmM0ZTE0IiBkPSJNMTY1LjUgMjQxYy0zLTItOC0xMi04LTEyczMtMTQgMTMtMThjMTAtNCAyMi01IDIyLTVzLTUgMTMtMTAgMTZjLTUgMy0xNyAxMi0xNyAxOXoiLz48cGF0aCBmaWxsPSIjZmEzMjBhIiBkPSJNMTkwLjUgNDRjLTM5LTE2LTEwMyAxNC0xMjMgNTctMTkgNDMgNCAxMDQgMTIgMTIyIDggMTggMjAgNTMgNTAgNjIgMzAgMTAgNzQtMiA5Ny0yNSAyMy0yMyAzNy02NyAzOC05NiAxLTI5LTE2LTc5LTQxLTExMC0yNS0zMC03My0yNi03NC0xMHoiLz48cGF0aCBmaWxsPSIjNjhhMDFhIiBkPSJNMTgwLjUgNWMtMTEgMC0yMSA3LTIzIDE4LTIgMTEgNSAyMyAxNiAyNiAxMSAzIDIzLTMgMjYtMTQgMy0xMS0yLTIzLTEyLTI2LTItMS00LTItNy00eiIvPjxwYXRoIGZpbGw9IiM4NWM0MjkiIGQ9Ik0yMjQuNSA0MmMtOC0yLTE3IDQtMTkgMTJzNSAxNyAxNCAxOWM4IDIgMTctNCAxOS0xMnMtNS0xNy0xNC0xOXoiLz48cGF0aCBmaWxsPSIjNzFhODIzIiBkPSJNMTkwLjUgMTJjLTExIDItMTkgMTEtMTggMjJzMTEgMTkgMjIgMThjMTEtMiAxOS0xMSAxOC0yMnMtMTEtMTktMjItMTh6Ii8+PHBhdGggZmlsbD0iI2YzMyIgZD0iTTI0Mi41IDEzN2MtMTMtNS0yMy0xLTIzLTFzLTEgMTIgNSAxNWM2IDMgMTkgMCAxOSAwcy0xLTE0LTEtMTR6Ii8+PHBhdGggZmlsbD0iI2ZhMzIwYSIgZD0iTTI1OS41IDE3NGMtNC00LTE1LTgtMTUtOHMtMSAxNiA1IDIxYzYgNSAxOCA0IDE4IDRzMy0xNy04LTE3eiIvPjxwYXRoIGZpbGw9IiNmMzMiIGQ9Ik0xMDkuNSAxOTZjLTEzLTItMjIgNS0yMiA1czUgMTIgMTQgMTNjMTAgMXQxOS03IDE5LTdzLTExLTItMTEtMXoiLz48cGF0aCBmaWxsPSIjZmEzMjBhIiBkPSJNMjExLjUgMjQwYy0yLTQtMTEtMTAtMTEtMTBzLTQgMTQgMSAxOGM0IDQgMTUgNiAxNSA2czYtMTAtNi0xNHoiLz48cGF0aCBmaWxsPSIjZjMzIiBkPSJNMTg5LjUgMjY0Yy0xLTQtNi0xMi02LTEyczMtMTEgMSAxNGM0IDMgMTIgNCAxMiA0czUtNS03LTZ6Ii8+PHBhdGggZmlsbD0iI2ZhMzIwYSIgZD0iTTE0OS41IDczYy0xLTItOS01LTktNXMwIDEwIDQgMTJjMyAyIDEwIDEgMTAgMXMtNC02LTUtOHoiLz48cGF0aCBmaWxsPSIjZjMzIiBkPSJNMTE1LjUgMTExYy0xLTMtOC05LTgtOXMtMSAxMCAzIDEzYzQgMyAxMCAzIDEwIDNzLTQtNS01LTd6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTE0My41IDEyNGMtMS00LTctMTEtNy0xMXMtMiAxMCAyIDEzYzQgMyAxMCA0IDEwIDRzLTQtNS01LTZ6IiBvcGFjaXR5PSIuMiIvPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0yMzkuNSAyMDRjLTEwLTE1LTI4LTI2LTQ5LTI3LTIxLTEtNDEgOC01NCAyNC0xMyAxNi0xOCA MzgtMTIgNTggNiAxOSAyMSAzNCA0MCA0MCAxOSA2IDQxIDQgNTgtOCAxNy0xMyAyNi0zMiAyNi01MyAwLTE5LTYtMzctMTktNDR6IiBvcGFjaXR5PSIuMiIvPjwvc3ZnPg==" className={className} alt="Rotten Tomatoes" />
);