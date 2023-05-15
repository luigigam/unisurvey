import express, { Request, Response, Router } from 'express';
import Event from '../models/event';

const router: Router = express.Router();

// Consenti la creazione di nuovo evento
router.post('/', async (req: Request, res: Response) => {
  try {
    const event = new Event(req.body);
    const newEvent = await event.save();
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create event' });
  }
});

// Consenti la modifica di un evento esistente
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update event' });
  }
});

// Consenti l'eliminazione di un evento già esistente
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete event' });
  }
});

export default router;
