import slug from 'slug';

// Function to generate a URL-friendly slug for song titles
export const slugifySongTitle = (title) => slug(title, { lower: true, replacement: '-' });

// Example utility function to normalize genres
export const normalizeGenre = (genre) => genre.trim().toLowerCase();