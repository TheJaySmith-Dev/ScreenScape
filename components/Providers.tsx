import React from 'react';
import type { WatchProviders, WatchProvider } from '../types.ts';

interface ProvidersProps {
  providers: WatchProviders;
}

const ProviderList: React.FC<{ title: string; list?: WatchProvider[] }> = ({ title, list }) => {
  if (!list || list.length === 0) return null;
  
  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-400 mb-2">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {list.slice(0, 8).map(provider => (
          <div key={provider.provider_name} title={provider.provider_name} className="flex items-center gap-2 bg-white/5 p-1 pr-1 rounded-full">
            <img 
              src={`https://image.tmdb.org/t/p/w45${provider.logo_path}`} 
              alt={provider.provider_name}
              className="w-7 h-7 rounded-full"
            />
          </div>
        ))}
      </div>
    </div>
  );
};


export const Providers: React.FC<ProvidersProps> = ({ providers }) => {
  return (
    <div className="flex flex-col gap-4 p-4 rounded-lg bg-white/5">
        <ProviderList title="Streaming" list={providers.flatrate} />
        <ProviderList title="Rent" list={providers.rent} />
        <ProviderList title="Buy" list={providers.buy} />
    </div>
  );
};