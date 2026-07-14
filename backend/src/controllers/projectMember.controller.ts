import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import * as projectMemberService from "../services/projectMember.service";
import { addMemberSchema } from "../validators/projectMember.validator";

export const addMember = async (req: AuthRequest, res: Response) => {
  try {
    const projectId = parseInt(req.params.id as string);
    const validatedData = addMemberSchema.parse(req.body);
    const userId = req.user.id;
    const role = req.user.role;

    if (role === "MANAGER") {
      const project = await projectMemberService.getProjectForMemberManagement(projectId, userId);
      if (!project) {
        return res.status(403).json({ message: "You can only assign members to your own projects" });
      }
    }

    await projectMemberService.addProjectMember(projectId, validatedData.userId);
    return res.status(201).json({ message: "Member added successfully" });
  } catch (error: any) {
    if (error.errors) return res.status(400).json({ errors: error.errors });
    return res.status(400).json({ message: error.message });
  }
};

export const getMembers = async (req: AuthRequest, res: Response) => {
  try {
    const projectId = parseInt(req.params.id as string);
    const members = await projectMemberService.getProjectMembers(projectId);
    
    return res.json(members);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const removeMember = async (req: AuthRequest, res: Response) => {
  try {
    const projectId = parseInt(req.params.id as string);
    const userId = parseInt(req.params.userId as string);
    
    await projectMemberService.removeProjectMember(projectId, userId);
    return res.json({ message: "Member removed successfully" });
  } catch (error: any) {
    return res.status(400).json({ message: "Member could not be removed or doesn't exist" });
  }
};

