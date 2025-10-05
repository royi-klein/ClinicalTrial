import express from 'express';
import { validateIssue } from '../middleware/validation.js';
import { authenticate } from '../middleware/auth.js';
import {
  getAllIssues,
  getIssueById,
  createIssue,
  updateIssue,
  deleteIssue,
  resolveIssue,
  getDashboardStats
} from '../controllers/issuesController.js';

const router = express.Router();

// All routes here are protected - apply auth middleware to all
router.use(authenticate);

// Dashboard stats
router.get('/dashboard', getDashboardStats);

// CRUD routes for issues
router.get('/issues', getAllIssues);
router.get('/issues/:id', getIssueById);
router.post('/issues', validateIssue, createIssue);
router.put('/issues/:id', validateIssue, updateIssue);
router.delete('/issues/:id', deleteIssue);

// Quick resolve
router.patch('/issues/:id/resolve', resolveIssue);

export default router;