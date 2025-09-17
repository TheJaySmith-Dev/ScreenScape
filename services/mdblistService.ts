import { MDBList } from "../types";

const API_BASE_URL = 'https://mdblist.com/api';

// This function now fetches a list by its ID and requires an API key.
export const getMDBList = async (listId: string, apiKey: string): Promise<MDBList> => {
  const response = await fetch(`${API_BASE_URL}/list/${listId}/?apiKey=${apiKey}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};
