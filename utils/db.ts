import { PrismaClient } from "@prisma/client";
import { Status } from "@prisma/client";

const prisma = new PrismaClient();

export const createProject = async (
  alias: string,
  environment: string,
  port: number,
  name: string,
  userId: number
) => {
  return await prisma.projects.create({
    data: {
      alias: alias,
      environment: environment,
      PORT: port,
      name: name,
      author: {
        connect: {
          id: userId,
        },
      },
    },
  });
};

export const getProjectByAlias = async (alias: string) => {
  return await prisma.projects.findUnique({
    where: {
      alias: alias,
    },
  });
};

export const updateProjectStatus = async (
  alias: string,
  status: string,
  updateData: Record<string, any> = {}
) => {
  return await prisma.projects.update({
    where: {
      alias: alias,
    },
    data: {
      status: status as Status,
      ...updateData,
    },
  });
};

export const getAllProjects = async () => {
  try{
    const projects = await prisma.projects.findMany();
    return {
      success: true,
      data: projects,
    };
  } catch (e) {
    return {
      success: false,
      data: {}
    }
  }
};
