import { Router } from 'express';
import * as educationController from '../controllers/education.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.get('/concepts', educationController.getFinancialConcepts);
router.get('/concepts/:id', educationController.getFinancialConceptById);
router.get('/tags', educationController.getAllTags);

// Protected routes (require authentication)
router.post('/concepts', authenticate, educationController.createFinancialConcept);
router.put('/concepts/:id', authenticate, educationController.updateFinancialConcept);
router.delete('/concepts/:id', authenticate, educationController.deleteFinancialConcept);

export default router;