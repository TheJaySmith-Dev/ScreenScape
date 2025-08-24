import type { CinemaChain } from '../types';

export const cinemaData: Record<string, CinemaChain[]> = {
  US: [
    { name: 'AMC Theatres', domain: 'amctheatres.com' },
    { name: 'Regal Cinemas', domain: 'regmovies.com' },
    { name: 'Cinemark Theatres', domain: 'cinemark.com' },
    { name: 'Reading Cinemas', domain: 'readingcinemasus.com' },
  ],
  GB: [
    { name: 'Cineworld', domain: 'cineworld.co.uk' },
    { name: 'Picturehouse', domain: 'picturehouses.com' },
    { name: 'Odeon', domain: 'odeon.co.uk' },
    { name: 'Vue', domain: 'myvue.com' },
  ],
  AU: [
    { name: 'Event Cinemas', domain: 'eventcinemas.com.au' },
    { name: 'Hoyts', domain: 'hoyts.com.au' },
    { name: 'Palace Cinemas', domain: 'palacecinemas.com.au' },
    { name: 'Village Cinemas', domain: 'villagecinemas.com.au' },
    { name: 'Reading Cinemas', domain: 'readingcinemas.com.au' },
  ],
  CA: [
    { name: 'Cineplex Entertainment', domain: 'cineplex.com' },
  ],
  IE: [
    { name: 'IMC Cinemas', domain: 'imc.ie' },
    { name: 'Omniplex Cinemas', domain: 'omniplex.ie' },
    { name: 'Cineworld', domain: 'cineworld.ie' },
  ],
  ZA: [
    { name: 'Ster-Kinekor', domain: 'sterkinekor.com' },
    { name: 'Nu Metro Cinemas', domain: 'numetro.co.za' },
  ],
  NZ: [
    { name: 'Event Cinemas', domain: 'eventcinemas.co.nz' },
    { name: 'Hoyts', domain: 'hoyts.co.nz' },
    { name: 'Reading Cinemas', domain: 'readingcinemas.co.nz' },
    { name: 'Movie Max Digital Cinemas', domain: 'moviemaxdigital.co.nz' },
  ]
};