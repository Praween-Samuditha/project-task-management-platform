import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import * as projectService from "../services/project.service";
import { createProjectSchema, updateProjectSchema } from "../validators/project.validator";

export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = createProjectSchema.parse(req.body);
    const userId = req.user.id;
    
    const project = await projectService.createProject(validatedData, userId);
    return res.status(201).json(project);
  } catch (error: any) {
    if (error.errors) return res.status(400).json({ errors: error.errors });
    return res.status(500).json({ message: error.message });
  }
};

export const getProjects = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const memberId = req.query.memberId ? parseInt(req.query.memberId as string) : undefined;

    const result = await projectService.getProjects(page, limit, memberId);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getProjectById = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const project = await projectService.getProjectById(id);
    
    if (!project) return res.status(404).json({ message: "Project not found" });
    return res.json(project);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateProject = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const validatedData = updateProjectSchema.parse(req.body);
    
    const project = await projectService.updateProject(id, validatedData);
    return res.json(project);
  } catch (error: any) {
    if (error.errors) return res.status(400).json({ errors: error.errors });
    return res.status(500).json({ message: error.message });
  }
};

export const deleteProject = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    await projectService.deleteProject(id);
    return res.json({ message: "Project deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
