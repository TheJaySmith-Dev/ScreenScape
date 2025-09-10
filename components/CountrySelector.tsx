import React from 'react';
import type { Country } from '../services/countryService.ts';

interface CountrySelectorProps {
  countries: Country[];
  selectedCode: string;
  onCountryChange: (code: string) => void;
}

export const CountrySelector: React.FC<CountrySelectorProps> = ({ countries, selectedCode, onCountryChange }) => {
  return (
    <div className="relative w-full">
      <select
        value={selectedCode}
        onChange={(e) => onCountryChange(e.target.value)}
        className="w-full appearance-none bg-white/5 border border-white/10 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 pr-8"
        aria-label="Select a country for streaming options"
      >
        {countries.map((country) => (
          <option key={country.code} value={country.code} className="bg-gray-800 text-white">
            {country.flag} {country.name}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>
    </div>
  );
};
