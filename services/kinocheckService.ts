const API_BASE_URL = 'https://api.kinocheck.com';

interface KinoCheckVideo {
    youtube_video_id: string;
}

interface KinoCheckMovie {
    trailer: KinoCheckVideo | null;
}

export const getKinoCheckTrailer = async (tmdbId: number, apiKey: string): Promise<string | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/movies?tmdb_id=${tmdbId}`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Api-Key': apiKey,
                'X-Api-Host': 'api.kinocheck.com'
            }
        });

        if (!response.ok) {
            console.error(`KinoCheck API request failed: ${response.status} ${response.statusText}`);
            return null;
        }

        const data: KinoCheckMovie = await response.json();

        if (data.trailer) {
            return `https://www.youtube.com/embed/${data.trailer.youtube_video_id}`;
        }

        return null;
    } catch (error) {
        console.error("Failed to fetch trailer from KinoCheck:", error);
        return null;
    }
};
