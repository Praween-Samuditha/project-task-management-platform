import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import * as taskService from "../services/task.service";
import { createTaskSchema, updateTaskSchema } from "../validators/task.validator";

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = createTaskSchema.parse(req.body);
    const task = await taskService.createTask({
      ...validatedData,
      createdById: req.user.id,
    });
    return res.status(201).json(task);
  } catch (error: any) {
    if (error.errors) return res.status(400).json({ errors: error.errors });
    return res.status(400).json({ message: error.message });
  }
};

export const getAllTasks = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
    const assigneeId = req.query.assigneeId ? parseInt(req.query.assigneeId as string) : undefined;
    const status = req.query.status as string | undefined;
    const priority = req.query.priority as string | undefined;

    const result = await taskService.getAllTasks({ page, limit, projectId, assigneeId, status, priority });
    return res.json(result);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const getTaskById = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const task = await taskService.getTaskById(id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    return res.json(task);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const validatedData = updateTaskSchema.parse(req.body);
    
    // Get current task to check permissions
    const currentTask = await taskService.getTaskById(id);
    if (!currentTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Allow MEMBER to update only if they're the assignee and only certain fields
    if (req.user.role === "MEMBER") {
      if (currentTask.assigneeId !== req.user.id) {
        return res.status(403).json({ message: "You can only update tasks assigned to you" });
      }
      // MEMBER can only update status and priority
      validatedData.status = validatedData.status || currentTask.status;
      validatedData.priority = validatedData.priority || currentTask.priority;
      // Clear fields MEMBER shouldn't be able to change
      delete (validatedData as any).title;
      delete (validatedData as any).description;
      delete (validatedData as any).assigneeId;
      delete (validatedData as any).dueDate;
    }

    const task = await taskService.updateTask(id, validatedData);
    return res.json(task);
  } catch (error: any) {
    if (error.errors) return res.status(400).json({ errors: error.errors });
    return res.status(400).json({ message: error.message });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    await taskService.deleteTask(id);
    return res.json({ message: "Task deleted successfully" });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};
