import React, { useState, useEffect } from 'react';
import * as mediaService from '../services/mediaService.ts';
import { MediaRow } from './MediaRow.tsx';
import { LoadingSpinner } from './LoadingSpinner.tsx';
import type { MediaDetails } from '../types.ts';
import { useSettings } from '../hooks/useSettings.ts';

interface MDBListCarouselProps {
  listId: string;
  title: string;
  onSelectMedia: (media: MediaDetails) => void;
}

export const MDBListCarousel: React.FC<MDBListCarouselProps> = ({ listId, title, onSelectMedia }) => {
  const [items, setItems] = useState<MediaDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { mdbListKey } = useSettings();

  useEffect(() => {
    const fetchList = async () => {
      if (!mdbListKey) {
        setError("MDBList API key is not set.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const results = await mediaService.fetchMediaFromMDBList(listId, mdbListKey);
        setItems(results);
      } catch (err) {
        setError('Failed to fetch MDBList.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchList();
  }, [listId, mdbListKey]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-48"><LoadingSpinner /></div>;
  }

  if (error) {
    return <div className="text-center text-red-400">{error}</div>;
  }

  return <MediaRow title={title} items={items} onSelect={onSelectMedia} />;
};
