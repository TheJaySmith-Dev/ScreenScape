// This is a simplified parser for MDBList pages. It assumes the HTML structure is consistent.
// In a production environment, a more robust parsing library or a dedicated backend proxy 
// would be preferable to handle potential CORS issues and HTML structure changes.

/**
 * Parses a string of HTML content to extract all TMDb IDs.
 * @param html The HTML content of the MDBList page.
 * @returns An array of unique TMDb IDs found on the page.
 */
const parseIdsFromHtml = (html: string): number[] => {
    const ids = new Set<number>();
    const regex = /data-tmdb-id="(\d+)"/g;
    let match;
    while ((match = regex.exec(html)) !== null) {
        if (match[1]) {
            ids.add(parseInt(match[1], 10));
        }
    }
    return Array.from(ids);
};

/**
 * Fetches an MDBList page and extracts all TMDb IDs from it.
 * @param listUrl The URL of the MDBList to fetch.
 * @returns A promise that resolves to an array of TMDb IDs. Returns an empty array on failure.
 */
export const fetchIdsFromMdbList = async (listUrl: string): Promise<number[]> => {
    // NOTE: Direct client-side fetching from external sites is blocked by CORS policies.
    // We use a public CORS proxy to circumvent this for demonstration purposes.
    // Switched to a new proxy due to reliability issues.
    const proxyUrl = `https://thingproxy.freeboard.io/fetch/${listUrl}`;
    try {
        const response = await fetch(proxyUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch MDBList via proxy with status: ${response.status}`);
        }
        const html = await response.text();
        return parseIdsFromHtml(html);
    } catch (error) {
        console.error(`Error fetching or parsing MDBList from ${listUrl}:`, error);
        return [];
    }
};