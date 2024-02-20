import { ObjectId } from 'mongodb';
// Find a list of songs, optionally with pagination
export async function findSongs(db, before, limit = 10) {
  const query = before ? { createdAt: { $lt: before } } : {};
  return db
    .collection('songs')
    .find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
}

// Insert a new song into the database
export async function insertSong(
  db,
  { creatorId, title, lyrics, genre, isPublic }
) {
  const song = {
    creatorId: new ObjectId(creatorId),
    title,
    lyrics,
    genre,
    isPublic,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const result = await db.collection('songs').insertOne(song);
  return result.ops[0];
}

// Find a song by its ID
export async function findSongById(db, songId) {
  return db.collection('songs').findOne({ _id: new ObjectId(songId) });
}

// Update a song by its ID
export async function updateSongById(db, songId, updateData) {
  const result = await db
    .collection('songs')
    .findOneAndUpdate(
      { _id: new ObjectId(songId) },
      { $set: updateData },
      { returnDocument: 'after' }
    );
  return result.value;
}

// Delete a song by its ID
export async function deleteSongById(db, songId) {
  const result = await db
    .collection('songs')
    .deleteOne({ _id: new ObjectId(songId) });
  return result.deletedCount === 1;
}
