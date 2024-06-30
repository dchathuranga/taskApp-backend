import { Request, Response } from 'express';
import Task, { ITask } from '../models/Task';
import { ApiResponse, AuthenticatedRequest } from '../types';

export const fetchTasks = async (req: AuthenticatedRequest, res: ApiResponse<ITask[]>) => {
  try {
    const userId = req.user?._id;
    const tasks = await Task.find({ userId, completed: false });
    res.status(200).json({
      success: true,
      data: tasks,
      message: 'Tasks fetched successfully',
    });
  } catch (error) {
    console.error('Error in fetchTasks:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Server error',
    });
  }
};

interface TaskReqBody {
  title: string;
  description?: string;
  dueDate?: string;
  tags?: string[];
}

export const addNewTask = async (req: AuthenticatedRequest<TaskReqBody>, res: ApiResponse<ITask>) => {
  try {
    const { title, description, dueDate, tags } = req.body;
    const { user } = req;

    if (!title) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Title is required.'
      });
    }

    const newTask = await Task.create({
      title,
      description,
      dueDate,
      tags,
      userId: user?._id.toString()
    });

    res.status(201).json({
      success: true,
      data: newTask,
      message: 'Task created successfully.'
    });
  } catch (error) {
    console.error('Error in addNewTask:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Server error'
    });
  }
};

interface UpdateReqBody extends ITask {
  _id: string;
}

export const updateTask = async (req: AuthenticatedRequest<UpdateReqBody>, res: ApiResponse<ITask>) => {
  try {
    const task = req.body;

    const updatedTask = await Task.findByIdAndUpdate(
      task._id,
      task,
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Could not update'
      });
    }

    res.json({
      success: true,
      data: updatedTask,
      message: 'Task updated successfully.'
    });
  } catch (error) {
    console.error('Error in updateTask:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Server error'
    });
  }
};

export const deleteTask = async (req: Request<{ taskId: string }>, res: Response) => {
  try {
    const taskId = req.params.taskId;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const deletedTask = await Task.findByIdAndDelete(taskId);

    res.json({
      success: true,
      data: deletedTask?._id,
      message: 'Task deleted successfully.'
    });
  } catch (error) {
    console.error('Error in deleteTask:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Server error'
    });
  }
};
