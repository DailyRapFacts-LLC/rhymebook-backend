import { fetcher } from '@/lib/fetch';
import useSWRInfinite from 'swr/infinite';
import { normalizeGenre, slugifySongTitle } from './utils'; // Import utility functions

export function useSongPages({ artistId, limit = 5 } = {}) {
  const getKey = (pageIndex, previousPageData) => {
    // reached the end
    if (previousPageData && !previousPageData.length) return null;

    return `/api/songs?artistId=${artistId}&limit=${limit}&page=${pageIndex + 1}`;
  };

  const { data, error, size, setSize } = useSWRInfinite(getKey, fetcher, {
    refreshInterval: 10000,
  });

  const isLoadingInitialData = !data && !error;
  const isLoadingMore =
    isLoadingInitialData || (size > 0 && typeof data[size - 1] === 'undefined');
  const isEmpty = data?.[0]?.length === 0;
  const isReachingEnd =
    isEmpty || (data && data[data.length - 1]?.length < limit);

  return {
    songs: data ? data.flat().map(song => ({
      ...song,
      genre: normalizeGenre(song.genre),
      titleSlug: slugifySongTitle(song.title)
    })) : [],
    isLoadingInitialData,
    isLoadingMore,
    isEmpty,
    isReachingEnd,
    size,
    setSize,
    error,
  };
}
