import type { MediaDetails } from '../types.ts';
import { fetchDetailsById } from './tmdbService.ts';

const MDBLIST_API_KEY = 'ao7byuxd9vygzgie8f0p9i9r6';
const MDBLIST_API_BASE_URL = 'https://mdblist.com/api/lists';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

interface MdbListItem {
  tmdb_id: number;
}

interface CachedData {
  media: MediaDetails[];
  timestamp: number;
}

const STREAMING_SERVICES = {
  disney: {
    name: 'Disney+',
    showsListId: 'garycrawfordgc/disney-shows',
    moviesListId: 'garycrawfordgc/disney-movies',
  },
  netflix: {
    name: 'Netflix',
    showsListId: 'garycrawfordgc/netflix-shows',
    moviesListId: 'garycrawfordgc/netflix-movies',
  },
  prime: {
    name: 'Prime Video',
    showsListId: 'garycrawfordgc/amazon-prime-shows',
    moviesListId: 'garycrawfordgc/amazon-prime-movies',
  },
};

type ServiceName = keyof typeof STREAMING_SERVICES;

const fetchMdbListIds = async (listId: string): Promise<number[]> => {
  const url = `${MDBLIST_API_BASE_URL}/${listId}/items`;
  try {
    const response = await fetch(url, {
      headers: {
        'X-Api-Key': MDBLIST_API_KEY,
      },
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`MDBList API Error (${response.status}) for ${listId}:`, errorText);
      throw new Error(`MDBList API request failed: ${response.statusText}`);
    }
    const data: MdbListItem[] = await response.json();
    return data.map(item => item.tmdb_id);
  } catch (error) {
    console.error(`Failed to fetch MDBList with ID ${listId}:`, error);
    return [];
  }
};

export const getStreamingServiceMedia = async (serviceName: ServiceName): Promise<MediaDetails[]> => {
  const cacheKey = `watchnow_mdblist_${serviceName}`;

  try {
    const cachedItem = localStorage.getItem(cacheKey);
    if (cachedItem) {
      const { media, timestamp }: CachedData = JSON.parse(cachedItem);
      if (Date.now() - timestamp < CACHE_DURATION_MS) {
        return media;
      }
    }
  } catch (error) {
    console.error(`Failed to read cache for ${serviceName}:`, error);
  }

  const service = STREAMING_SERVICES[serviceName];
  
  const [movieIds, showIds] = await Promise.all([
    fetchMdbListIds(service.moviesListId),
    fetchMdbListIds(service.showsListId),
  ]);

  const moviePromises = movieIds.map(id => fetchDetailsById(id, 'movie'));
  const showPromises = showIds.map(id => fetchDetailsById(id, 'tv'));

  const results = await Promise.all([...moviePromises, ...showPromises]);

  const validMedia = results.filter((media): media is MediaDetails => 
    media !== null && 
    !!media.posterUrl && 
    media.posterUrl.includes('image.tmdb.org')
  );
  
  validMedia.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
  
  try {
    if (validMedia.length > 0) { // Only cache if we got some results
        const cacheData: CachedData = {
          media: validMedia,
          timestamp: Date.now(),
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    }
  } catch (error) {
    console.error(`Failed to write cache for ${serviceName}:`, error);
  }

  return validMedia;
};
