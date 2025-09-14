import type { Person } from '../types.ts';
import { popularActors } from './peopleData.ts';

export const getTrendingActors = (): Person[] => {
    return popularActors.map(actor => ({
        id: actor.name.toLowerCase().replace(/\s/g, '-'),
        name: actor.name,
        posterUrl: '', // This will be fetched on demand
        tmdbId: actor.id,
        role: 'actor',
        birthday: actor.birthday,
    }));
};

export const people: Person[] = getTrendingActors();
