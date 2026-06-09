import express from 'express';
import {
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  archiveHabit,
  reorderHabit,
} from '../controllers/habitController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.get('/', getHabits);
router.post('/', createHabit);
router.put('/:id', updateHabit);
router.delete('/:id', deleteHabit);
router.post('/:id/archive', archiveHabit);
router.post('/reorder', reorderHabit);

export default router;
