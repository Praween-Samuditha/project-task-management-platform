import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import prisma from "../config/prisma";

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role.name,
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const { firstName, lastName, email, password, roleId } = req.body;
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "firstName, lastName, email and password are required" });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    const { hashPassword } = await import("../utils/hash");
    const hashed = await hashPassword(password);

    const user = await prisma.user.create({
      data: { firstName, lastName, email, password: hashed, roleId: roleId ?? 3 },
      select: { id: true, firstName: true, lastName: true, email: true, isActive: true, role: { select: { id: true, name: true } }, createdAt: true },
    });
    return res.status(201).json(user);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          isActive: true,
          role: {
            select: {
              id: true,
              name: true,
            }
          },
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count(),
    ]);

    return res.json({
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.id as string);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        isActive: true,
        role: {
          select: {
            id: true,
            name: true,
          }
        },
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.id as string);
    const { roleId } = req.body;

    if (!roleId) {
      return res.status(400).json({ message: "Role ID is required" });
    }

    // Verify role exists
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { roleId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: {
          select: {
            id: true,
            name: true,
          }
        },
      },
    });

    return res.json({ message: "User role updated successfully", user });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const deactivateUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.id as string);

    // Prevent self-deactivation
    if (req.user.id === userId) {
      return res.status(400).json({ message: "Cannot deactivate your own account" });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    return res.json({ message: "User deactivated successfully" });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const activateUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.id as string);

    await prisma.user.update({
      where: { id: userId },
      data: { isActive: true },
    });

    return res.json({ message: "User activated successfully" });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.id as string);

    if (req.user.id === userId) {
      return res.status(400).json({ message: "Cannot remove your own account" });
    }

    await prisma.user.delete({ where: { id: userId } });

    return res.json({ message: "User removed successfully" });
  } catch {
    return res.status(400).json({ message: "User could not be removed. Deactivate the user if they own projects or tasks." });
  }
};

