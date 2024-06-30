import express, { RequestHandler } from 'express';
import { protect } from '../middleware/authMiddleware';
import { addNewTask, deleteTask, fetchTasks, updateTask } from '../controllers/taskController';

const router = express.Router();

router.get('/', protect, fetchTasks);
router.post('/', protect, addNewTask);
router.put('/', protect, updateTask);
router.delete('/:taskId', protect, deleteTask);

export default router;
