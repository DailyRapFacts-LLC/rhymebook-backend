// pages/api/songs/[songId].js
import { ValidateProps } from '@/api-lib/constants';
import {
  findSongById,
  updateSongById,
  deleteSongById,
} from '@/api-lib/db/song'; // Implement these DB functions
import { auths, validateBody } from '@/api-lib/middlewares';
import { getMongoDb } from '@/api-lib/mongodb';
import { ncOpts } from '@/api-lib/nc';
import nc from 'next-connect';

const handler = nc(ncOpts);

// Fetch a specific song
handler.get(async (req, res) => {
  const db = await getMongoDb();
  const song = await findSongById(db, req.query.songId);

  if (!song) {
    return res.status(404).json({ error: { message: 'Song not found.' } });
  }

  return res.json({ song });
});

// Update a specific song
handler.use(...auths).put(
  validateBody({
    type: 'object',
    properties: {
      title: ValidateProps.song.title,
      lyrics: ValidateProps.song.lyrics,
      genre: ValidateProps.song.genre,
      isPublic: ValidateProps.song.isPublic,
    },
    required: [],
    additionalProperties: false,
  }),
  async (req, res) => {
    if (!req.user) {
      return res.status(401).end();
    }

    const db = await getMongoDb();
    const { title, lyrics, genre, isPublic } = req.body;

    const updatedSong = await updateSongById(db, req.query.songId, {
      ...(title && { title }),
      ...(lyrics && { lyrics }),
      ...(genre && { genre }),
      ...(typeof isPublic === 'boolean' && { isPublic }),
    });

    if (!updatedSong) {
      return res.status(404).json({ error: { message: 'Song not found.' } });
    }

    return res.json({ song: updatedSong });
  }
);

// Delete a specific song
handler.use(...auths).delete(async (req, res) => {
  const db = await getMongoDb();
  const result = await deleteSongById(db, req.query.songId);

  if (!result) {
    return res
      .status(404)
      .json({ error: { message: 'Song not found or failed to delete.' } });
  }

  return res.status(204).end();
});

export default handler;
