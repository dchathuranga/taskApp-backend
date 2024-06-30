import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description?: string;
  dueDate?: Date;
  tags?: string[];
  userId: string;
  completed: boolean;
}

const taskSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date },
  tags: [{ type: String }],
  userId: { type: String, ref: 'User', required: true },
  completed: { type: Boolean, default: false },
});

const Task = mongoose.model<ITask>('Task', taskSchema);
export default Task;
