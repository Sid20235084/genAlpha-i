import projectModel from '../models/project.model.js';
import * as projectService from '../services/project.service.js';
import userModel from '../models/user.model.js';
import { validationResult, body, param } from 'express-validator';

/**
 * Create a new project.
 * This function validates the request using express-validator within the controller.
 */
export const createProject = async (req, res) => {
    try {
        // Run validation chain: check that "name" is provided as a string
        await body('name').isString().withMessage('Name is required and must be a string').run(req);
        
        // Check for any validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name } = req.body;
        // Find the logged-in user using the email from req.user (set by auth middleware)
        const loggedInUser = await userModel.findOne({ email: req.user.email });
        if (!loggedInUser) {
            return res.status(404).json({ error: 'Logged in user not found.' });
        }
        const userId = loggedInUser._id;

        // Create a new project using the project service
        const newProject = await projectService.createProject({ name, userId });
        return res.status(201).json(newProject);
    } catch (err) {
        console.error(err);
        return res.status(400).send(err.message);
    }
};

/**
 * Retrieve all projects for the logged-in user.
 * (No validation needed since this route does not take additional parameters.)
 */
export const getAllProject = async (req, res) => {
    try {
        // Find the logged-in user
        const loggedInUser = await userModel.findOne({ email: req.user.email });
        if (!loggedInUser) {
            return res.status(404).json({ error: 'Logged in user not found.' });
        }

        // Retrieve all projects for the user
        const allUserProjects = await projectService.getAllProjectByUserId({ userId: loggedInUser._id });
        return res.status(200).json({ projects: allUserProjects });
    } catch (err) {
        console.error(err);
        return res.status(400).json({ error: err.message });
    }
};

/**
 * Add one or more users to an existing project.
 * Validates that:
 * - projectId is a non-empty string.
 * - users is a non-empty array, where every element is a string.
 */
export const addUserToProject = async (req, res) => {
    try {
        // Run validations for "projectId" and "users"
        await body('projectId').isString().withMessage('Project ID is required and must be a string').run(req);
        await body('users')
            .isArray({ min: 1 })
            .withMessage('Users must be a non-empty array')
            .custom((users) => users.every(user => typeof user === 'string' && user.trim() !== ''))
            .withMessage('Each user must be a non-empty string')
            .run(req);
        
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const { projectId, users } = req.body;
        // Retrieve logged in user for permission or audit purposes
        const loggedInUser = await userModel.findOne({ email: req.user.email });
        if (!loggedInUser) {
            return res.status(404).json({ error: 'Logged in user not found.' });
        }

        // Add users to the project via the service
        const project = await projectService.addUsersToProject({
            projectId,
            users,
            userId: loggedInUser._id
        });
        return res.status(200).json({ project });
    } catch (err) {
        console.error(err);
        return res.status(400).json({ error: err.message });
    }
};

/**
 * Retrieve a project by its ID.
 * Validates that "projectId" from req.params is a non-empty string.
 */
export const getProjectById = async (req, res) => {
    try {
        // Validate the "projectId" URL parameter
        await param('projectId').isString().withMessage('Project ID is required and must be a string').run(req);
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const { projectId } = req.params;
        // Fetch the project by ID using the service function
        const project = await projectService.getProjectById({ projectId });
        return res.status(200).json({ project });
    } catch (err) {
        console.error(err);
        return res.status(400).json({ error: err.message });
    }
};

/**
 * Update the file tree of a project.
 * Validates that:
 * - projectId is a non-empty string.
 * - fileTree is an object.
 */
export const updateFileTree = async (req, res) => {
    try {
        // Run validations for "projectId" and "fileTree"
        await body('projectId').isString().withMessage('Project ID is required and must be a string').run(req);
        await body('fileTree').isObject().withMessage('File tree is required and must be an object').run(req);
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const { projectId, fileTree } = req.body;
        // Update the file tree for the project via the service
        const project = await projectService.updateFileTree({ projectId, fileTree });
        return res.status(200).json({ project });
    } catch (err) {
        console.error(err);
        return res.status(400).json({ error: err.message });
    }
};
