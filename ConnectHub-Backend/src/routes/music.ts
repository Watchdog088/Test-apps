import express from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth';
import logger from '../config/logger';
const router = express.Router();

// GET /api/v1/music/playlists
router.get('/playlists', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const playlists = await prisma.playlist.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: { playlists } });
  } catch (error) { logger.error('Get playlists error:', error); res.status(500).json({ success: false, message: 'Internal server error' }); }
});

// POST /api/v1/music/playlists
router.post('/playlists', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { name, description, isPublic } = req.body;
    const playlist = await prisma.playlist.create({ data: { userId, name, description, isPublic: isPublic ?? false } });
    res.status(201).json({ success: true, data: { playlist } });
  } catch (error) { logger.error('Create playlist error:', error); res.status(500).json({ success: false, message: 'Internal server error' }); }
});

// POST /api/v1/music/playlists/:id/tracks — add track
router.post('/playlists/:id/tracks', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { trackId, trackTitle, trackArtist, trackUrl, durationSeconds } = req.body;
    const playlist = await prisma.playlist.findFirst({ where: { id: req.params.id, userId } });
    if (!playlist) return res.status(404).json({ success: false, message: 'Playlist not found' });
    const count = await prisma.playlistTrack.count({ where: { playlistId: req.params.id } });
    const track = await prisma.playlistTrack.create({ data: { playlistId: req.params.id, trackId, trackTitle, trackArtist, trackUrl, durationSeconds, position: count } });
    res.status(201).json({ success: true, data: { track } });
  } catch (error) { logger.error('Add track error:', error); res.status(500).json({ success: false, message: 'Internal server error' }); }
});

// DELETE /api/v1/music/playlists/:id
router.delete('/playlists/:id', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    await prisma.playlist.deleteMany({ where: { id: req.params.id, userId } });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) { logger.error('Delete playlist error:', error); res.status(500).json({ success: false, message: 'Internal server error' }); }
});

export default router;
