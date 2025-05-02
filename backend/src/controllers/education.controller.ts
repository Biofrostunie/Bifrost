import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { EducationService } from '../services/education.service';

const prisma = new PrismaClient();
const educationService = new EducationService(prisma);

/**
 * @swagger
 * /education/concepts:
 *   post:
 *     summary: Create a new financial concept
 *     tags: [Education]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FinancialConcept'
 *     responses:
 *       201:
 *         description: Financial concept created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
export const createFinancialConcept = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const result = await educationService.createFinancialConcept(data);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /education/concepts:
 *   get:
 *     summary: Get financial concepts
 *     tags: [Education]
 *     parameters:
 *       - in: query
 *         name: tags
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         style: form
 *         explode: true
 *         description: Filter by tags
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title and content
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Financial concepts retrieved successfully
 */
export const getFinancialConcepts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, page, limit } = req.query;
    
    // Handle tags as array
    const tags = Array.isArray(req.query.tags)
      ? req.query.tags as string[]
      : req.query.tags
      ? [req.query.tags as string]
      : undefined;
    
    const params = {
      tags,
      search: search as string | undefined,
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
    };
    
    const result = await educationService.getFinancialConcepts(params);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /education/concepts/{id}:
 *   get:
 *     summary: Get financial concept by ID
 *     tags: [Education]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Financial concept retrieved successfully
 *       404:
 *         description: Financial concept not found
 */
export const getFinancialConceptById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await educationService.getFinancialConceptById(id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /education/concepts/{id}:
 *   put:
 *     summary: Update financial concept
 *     tags: [Education]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FinancialConcept'
 *     responses:
 *       200:
 *         description: Financial concept updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Financial concept not found
 */
export const updateFinancialConcept = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const result = await educationService.updateFinancialConcept(id, data);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /education/concepts/{id}:
 *   delete:
 *     summary: Delete financial concept
 *     tags: [Education]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Financial concept deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Financial concept not found
 */
export const deleteFinancialConcept = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await educationService.deleteFinancialConcept(id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /education/tags:
 *   get:
 *     summary: Get all financial concept tags
 *     tags: [Education]
 *     responses:
 *       200:
 *         description: Tags retrieved successfully
 */
export const getAllTags = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await educationService.getAllTags();
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};