import prisma from "../config/prisma";
import { hashPassword, comparePassword } from "../utils/hash";
import { generateToken } from "../utils/jwt";

export const registerUser = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string
) => {
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        throw new Error("Email already exists");
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
        data: {
            firstName,
            lastName,
            email,
            password: hashedPassword,
            roleId: 3  // Default to MEMBER role
        },
        include: {
            role: true,
        },
    });

    const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role.name,
    });

    const { password: _, ...userWithoutPassword } = user;

    return {
        token,
        user: userWithoutPassword,
    };
};

export const loginUser = async (
  email: string,
  password: string
) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      role: true,
    },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isPasswordValid = await comparePassword(
    password,
    user.password
  );

  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  if (!user.isActive) {
    throw new Error("Your account has been deactivated. Please contact an administrator.");
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role.name,
  });

  const { password: _, ...userWithoutPassword } = user;

  return {
    token,
    user: userWithoutPassword,
  };
};
