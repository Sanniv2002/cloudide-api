/**
 * Project Database Utilities using Prisma ORM
 *
 * This file provides utility functions for interacting with the `projects` table in the database using Prisma.
 * It allows the creation, fetching, and updating of project records, including handling custom statuses and error responses.
 *
 * Functions in this file include:
 * - `createProject`: Creates a new project record in the database.
 * - `getProjectByAlias`: Fetches a project by its alias.
 * - `updateProjectStatus`: Updates the status of a project and allows additional fields to be updated.
 * - `getAllProjects`: Retrieves all projects with basic error handling.
 *
 * @function createProject
 * @param {string} alias - The unique alias of the project.
 * @param {string} environment - The environment (e.g., "development", "production") of the project.
 * @param {number} port - The port number the project is running on.
 * @param {string} name - The name of the project.
 * @param {string} dns_record_id - The DNS record ID associated with the project.
 * @param {number} userId - The ID of the user who created the project.
 * @returns {Promise<Object>} - A promise that resolves with the newly created project.``
 *
 * @function getProjectByAlias
 * @param {string} alias - The unique alias of the project.
 * @returns {Promise<Object | null>} - A promise that resolves with the project if found, or `null` if not found.
 *
 * @function updateProjectStatus
 * @param {string} alias - The unique alias of the project.
 * @param {string} status - The new status of the project (must be a valid `Status` enum value).
 * @param {Record<string, any>} [updateData={}] - Optional additional fields to update.
 * @returns {Promise<Object>} - A promise that resolves with the updated project.
 *
 * @function getAllProjects
 * @returns {Promise<{ success: boolean, data: Object[] | {} }>} - A promise that resolves with an object containing the success status and data (projects or empty).
 *
 */

import { PrismaClient } from '@prisma/client';
import { Status } from '@prisma/client';

const prisma = new PrismaClient();

export const upsertUser = async (data: {
  email: string;
  name: string;
  password?: string;
  googleId?: string;
  institution_type?: string;
}) => {
  try {
    const user = await prisma.user.upsert({
      where: {
        email: data.email,
      },
      update: {
        name: data.name,
        ...(data.password && { password: data.password }),
        ...(data.googleId && { googleId: data.googleId }),
        ...(data.institution_type && { institution_type: data.institution_type }),
      },
      create: {
        email: data.email,
        name: data.name,
        ...(data.password && { password: data.password }),
        ...(data.googleId && { googleId: data.googleId }),
        ...(data.institution_type && { institution_type: data.institution_type }),
      },
    });

    return {
      success: true,
      data: user,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const findUserById = async (id: number) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });
    return user;
  } catch (error: any) {
    console.error('Error finding user by ID:', error);
    return null;
  }
};

export const createProject = async (
  alias: string,
  environment: string,
  port: number,
  name: string,
  dns_record_id: string,
  userId: number,
) => {
  return await prisma.projects.create({
    data: {
      alias: alias,
      environment: environment,
      PORT: port,
      dns_record_id: dns_record_id,
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
  updateData: Record<string, any> = {},
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
  try {
    const projects = await prisma.projects.findMany();
    return {
      success: true,
      data: projects,
    };
  } catch (e) {
    return {
      success: false,
      data: {},
    };
  }
};

export const getAllProjectsByUserId = async (userId: number) => {
  try {
    const projects = await prisma.projects.findMany({
      where: {
        authorId: userId,
      },
    });
    return {
      success: true,
      data: projects,
    };
  } catch (e: any) {
    return {
      success: false,
      data: {},
      error: e.message,
    };
  }
};
