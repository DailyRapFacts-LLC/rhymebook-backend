// pages/api/songs/index.js
import { ValidateProps } from '@/api-lib/constants';
import { insertSong, findSongs } from '@/api-lib/db/song'; // You'll need to implement these functions
import { auths, validateBody } from '@/api-lib/middlewares';
import { getMongoDb } from '@/api-lib/mongodb';
import { ncOpts } from '@/api-lib/nc';
import nc from 'next-connect';

const handler = nc(ncOpts);

// Fetch a list of songs
handler.get(async (req, res) => {
  const db = await getMongoDb();
  const songs = await findSongs(
    db,
    req.query.before ? new Date(req.query.before) : undefined,
    req.query.limit ? parseInt(req.query.limit, 10) : undefined
  );
  return res.json({ songs });
});

// Add a new song
handler.post(
  ...auths,
  validateBody({
    type: 'object',
    properties: {
      title: ValidateProps.song.title,
      lyrics: ValidateProps.song.lyrics,
      genre: ValidateProps.song.genre,
      isPublic: ValidateProps.song.isPublic,
    },
    required: ['title', 'lyrics', 'genre', 'isPublic'],
    additionalProperties: false,
  }),
  async (req, res) => {
    if (!req.user) {
      return res.status(401).end();
    }

    const db = await getMongoDb();

    const { title, lyrics, genre, isPublic } = req.body;

    const song = await insertSong(db, {
      creatorId: req.user._id,
      title,
      lyrics,
      genre,
      isPublic,
    });

    return res.status(201).json({ song });
  }
);

export default handler;
