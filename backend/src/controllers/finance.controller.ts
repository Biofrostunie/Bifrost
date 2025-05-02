import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { FinanceService } from '../services/finance.service';

const prisma = new PrismaClient();
const financeService = new FinanceService(prisma);

/**
 * Income Categories Controllers
 */

/**
 * @swagger
 * /finance/income-categories:
 *   post:
 *     summary: Create a new income category
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       201:
 *         description: Income category created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
export const createIncomeCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const result = await financeService.createIncomeCategory(data);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /finance/income-categories:
 *   get:
 *     summary: Get all income categories
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Income categories retrieved successfully
 *       401:
 *         description: Unauthorized
 */
export const getIncomeCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await financeService.getIncomeCategories();
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /finance/income-categories/{id}:
 *   get:
 *     summary: Get income category by ID
 *     tags: [Finance]
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
 *         description: Income category retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Income category not found
 */
export const getIncomeCategoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await financeService.getIncomeCategoryById(id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /finance/income-categories/{id}:
 *   put:
 *     summary: Update income category
 *     tags: [Finance]
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
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       200:
 *         description: Income category updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Income category not found
 */
export const updateIncomeCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const result = await financeService.updateIncomeCategory(id, data);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /finance/income-categories/{id}:
 *   delete:
 *     summary: Delete income category
 *     tags: [Finance]
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
 *         description: Income category deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Income category not found
 */
export const deleteIncomeCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await financeService.deleteIncomeCategory(id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * Incomes Controllers
 */

/**
 * @swagger
 * /finance/incomes:
 *   post:
 *     summary: Create a new income
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Income'
 *     responses:
 *       201:
 *         description: Income created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 */
export const createIncome = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const data = req.body;
    const result = await financeService.createIncome(userId, data);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /finance/incomes:
 *   get:
 *     summary: Get all user incomes
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Incomes retrieved successfully
 *       401:
 *         description: Unauthorized
 */
export const getUserIncomes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const result = await financeService.getUserIncomes(userId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /finance/incomes/{id}:
 *   get:
 *     summary: Get income by ID
 *     tags: [Finance]
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
 *         description: Income retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Income not found
 */
export const getIncomeById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const result = await financeService.getIncomeById(id, userId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /finance/incomes/{id}:
 *   put:
 *     summary: Update income
 *     tags: [Finance]
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
 *             $ref: '#/components/schemas/Income'
 *     responses:
 *       200:
 *         description: Income updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Income not found
 */
export const updateIncome = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const data = req.body;
    const result = await financeService.updateIncome(id, userId, data);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /finance/incomes/{id}:
 *   delete:
 *     summary: Delete income
 *     tags: [Finance]
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
 *         description: Income deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Income not found
 */
export const deleteIncome = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const result = await financeService.deleteIncome(id, userId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * Expense Categories Controllers
 */

/**
 * @swagger
 * /finance/expense-categories:
 *   post:
 *     summary: Create a new expense category
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       201:
 *         description: Expense category created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
export const createExpenseCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const result = await financeService.createExpenseCategory(data);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /finance/expense-categories:
 *   get:
 *     summary: Get all expense categories
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Expense categories retrieved successfully
 *       401:
 *         description: Unauthorized
 */
export const getExpenseCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await financeService.getExpenseCategories();
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /finance/expense-categories/{id}:
 *   get:
 *     summary: Get expense category by ID
 *     tags: [Finance]
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
 *         description: Expense category retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Expense category not found
 */
export const getExpenseCategoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await financeService.getExpenseCategoryById(id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /finance/expense-categories/{id}:
 *   put:
 *     summary: Update expense category
 *     tags: [Finance]
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
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       200:
 *         description: Expense category updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Expense category not found
 */
export const updateExpenseCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const result = await financeService.updateExpenseCategory(id, data);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /finance/expense-categories/{id}:
 *   delete:
 *     summary: Delete expense category
 *     tags: [Finance]
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
 *         description: Expense category deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Expense category not found
 */
export const deleteExpenseCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await financeService.deleteExpenseCategory(id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * Expenses Controllers
 */

/**
 * @swagger
 * /finance/expenses:
 *   post:
 *     summary: Create a new expense
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Expense'
 *     responses:
 *       201:
 *         description: Expense created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 */
export const createExpense = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const data = req.body;
    const result = await financeService.createExpense(userId, data);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /finance/expenses:
 *   get:
 *     summary: Get all user expenses
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Expenses retrieved successfully
 *       401:
 *         description: Unauthorized
 */
export const getUserExpenses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const result = await financeService.getUserExpenses(userId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /finance/expenses/{id}:
 *   get:
 *     summary: Get expense by ID
 *     tags: [Finance]
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
 *         description: Expense retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Expense not found
 */
export const getExpenseById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const result = await financeService.getExpenseById(id, userId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /finance/expenses/{id}:
 *   put:
 *     summary: Update expense
 *     tags: [Finance]
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
 *             $ref: '#/components/schemas/Expense'
 *     responses:
 *       200:
 *         description: Expense updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Expense not found
 */
export const updateExpense = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const data = req.body;
    const result = await financeService.updateExpense(id, userId, data);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /finance/expenses/{id}:
 *   delete:
 *     summary: Delete expense
 *     tags: [Finance]
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
 *         description: Expense deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Expense not found
 */
export const deleteExpense = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const result = await financeService.deleteExpense(id, userId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * Investment Simulation Controllers
 */

/**
 * @swagger
 * /finance/investment-simulations:
 *   post:
 *     summary: Create a new investment simulation
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InvestmentSimulation'
 *     responses:
 *       201:
 *         description: Investment simulation created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
export const createInvestmentSimulation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const data = req.body;
    const result = await financeService.createInvestmentSimulation(userId, data);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /finance/investment-simulations:
 *   get:
 *     summary: Get all user investment simulations
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Investment simulations retrieved successfully
 *       401:
 *         description: Unauthorized
 */
export const getUserInvestmentSimulations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const result = await financeService.getUserInvestmentSimulations(userId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /finance/investment-simulations/{id}:
 *   get:
 *     summary: Get investment simulation by ID
 *     tags: [Finance]
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
 *         description: Investment simulation retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Investment simulation not found
 */
export const getInvestmentSimulationById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const result = await financeService.getInvestmentSimulationById(id, userId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /finance/investment-simulations/{id}:
 *   delete:
 *     summary: Delete investment simulation
 *     tags: [Finance]
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
 *         description: Investment simulation deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Investment simulation not found
 */
export const deleteInvestmentSimulation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const result = await financeService.deleteInvestmentSimulation(id, userId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * Dashboard Controllers
 */

/**
 * @swagger
 * /finance/dashboard:
 *   get:
 *     summary: Get financial overview for dashboard
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering data
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering data
 *     responses:
 *       200:
 *         description: Financial overview retrieved successfully
 *       401:
 *         description: Unauthorized
 */
export const getDashboardData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    
    // Parse dates from query parameters, default to current month
    const now = new Date();
    const startDate = req.query.startDate 
      ? new Date(req.query.startDate as string) 
      : new Date(now.getFullYear(), now.getMonth(), 1);
    
    const endDate = req.query.endDate 
      ? new Date(req.query.endDate as string) 
      : new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const result = await financeService.getFinancialOverview(userId, startDate, endDate);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};