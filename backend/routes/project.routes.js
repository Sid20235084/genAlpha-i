import { Router } from 'express';
import * as projectController from '../controllers/project.controller.js';
import * as authMiddleWare from '../middleware/auth.middleware.js';

const router = Router();

// Route for creating a project. Validations run inside the controller.
router.post('/create', authMiddleWare.authUser, projectController.createProject);

// Route for getting all projects for the logged-in user.
router.get('/all', authMiddleWare.authUser, projectController.getAllProject);

// Route for adding user(s) to a project.
router.put('/add-user', authMiddleWare.authUser, projectController.addUserToProject);

// Route for retrieving a project by its ID.
router.get('/get-project/:projectId', authMiddleWare.authUser, projectController.getProjectById);

// Route for updating a project's file tree.
router.put('/update-file-tree', authMiddleWare.authUser, projectController.updateFileTree);

export default router;
