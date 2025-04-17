import projectModel from '../models/project.model.js';
import mongoose from 'mongoose';

/**
 * Create a new project.
 * Expects an object with properties: name and userId.
 * - name: (string) The name of the project.
 * - userId: (string) The id of the user creating the project.
 *
 * @param {Object} data - The input data.
 * @returns {Promise<Object>} The newly created project.
 * @throws {Error} If name or userId is missing or if the project name already exists.
 */
export const createProject = async (data) => {
    // Destructure necessary fields from data
    const { name, userId } = data;

    if (!name) {
        throw new Error('Name is required');
    }
    if (!userId) {
        throw new Error('UserId is required');
    }

    try {
        // Create the project with the provided name and add the creator's userId in the users array.
        const project = await projectModel.create({
            name,
            users: [userId]
        });
        return project;
    } catch (error) {
        // If error code 11000 appears, it means there's a duplicate key (project name exists).
        if (error.code === 11000) {
            throw new Error('Project name already exists');
        }
        throw error;
    }
};

/**
 * Retrieve all projects associated with a given user.
 * Expects an object with property: userId.
 *
 * @param {Object} data - The input data.
 * @param {string} data.userId - The user id to fetch projects for.
 * @returns {Promise<Array>} An array of project documents.
 * @throws {Error} If userId is not provided.
 */
export const getAllProjectByUserId = async (data) => {
    // Destructure userId from data
    const { userId } = data;

    if (!userId) {
        throw new Error('UserId is required');
    }

    // Find all projects where the provided userId exists in the "users" array.
    const allUserProjects = await projectModel.find({
        users: userId
    });
    return allUserProjects;
};

/**
 * Add additional users to an existing project.
 * Expects an object with the following properties:
 * - projectId: (string) The id of the project.
 * - users: (Array of string) The user ids to be added.
 * - userId: (string) The id of the user making the request.
 *
 * @param {Object} data - The input data.
 * @returns {Promise<Object>} The updated project document.
 * @throws {Error} If any of the required fields are missing or invalid.
 */
export const addUsersToProject = async (data) => {
    // Destructure projectId, users, and userId from data
    const { projectId, users, userId } = data;

    // Validate projectId
    if (!projectId) {
        throw new Error("projectId is required");
    }
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid projectId");
    }

    // Validate users: must be provided as an array and every element must be a valid ObjectId.
    if (!users) {
        throw new Error("users are required");
    }
    if (!Array.isArray(users) || users.some(uid => !mongoose.Types.ObjectId.isValid(uid))) {
        throw new Error("Invalid userId(s) in users array");
    }

    // Validate the requester userId.
    if (!userId) {
        throw new Error("userId is required");
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid userId");
    }

    // Check that the requester belongs to the project
    const project = await projectModel.findOne({
        _id: projectId,
        users: userId
    });

    console.log(project);

    if (!project) {
        throw new Error("User does not belong to this project");
    }

    // Update the project to add the new users (without duplicates) using $addToSet with $each.
    const updatedProject = await projectModel.findOneAndUpdate(
        { _id: projectId },
        { $addToSet: { users: { $each: users } } },
        { new: true }
    );

    return updatedProject;
};

/**
 * Retrieve a project by its ID.
 * Expects an object with property: projectId.
 *
 * @param {Object} data - The input data.
 * @param {string} data.projectId - The id of the project.
 * @returns {Promise<Object>} The project document with populated users field.
 * @throws {Error} If projectId is missing or invalid.
 */
export const getProjectById = async (data) => {
    // Destructure projectId from data
    const { projectId } = data;

    if (!projectId) {
        throw new Error("projectId is required");
    }
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid projectId");
    }

    // Find the project by id and populate the "users" field for detailed info.
    const project = await projectModel.findOne({
        _id: projectId
    }).populate('users');

    return project;
};

/**
 * Update the file tree for a project.
 * Expects an object with the following properties:
 * - projectId: (string) The id of the project.
 * - fileTree: (Object) The new file tree structure.
 *
 * @param {Object} data - The input data.
 * @returns {Promise<Object>} The updated project document.
 * @throws {Error} If projectId is missing/invalid or fileTree is not provided.
 */
export const updateFileTree = async (data) => {
    // Destructure projectId and fileTree from data
    const { projectId, fileTree } = data;

    if (!projectId) {
        throw new Error("projectId is required");
    }
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid projectId");
    }
    if (!fileTree) {
        throw new Error("fileTree is required");
    }

    // Update the project's fileTree field and return the updated document.
    const project = await projectModel.findOneAndUpdate(
        { _id: projectId },
        { fileTree },
        { new: true }
    );

    return project;
};
