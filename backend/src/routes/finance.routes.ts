import { Router } from 'express';
import * as financeController from '../controllers/finance.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// All finance routes require authentication
router.use(authenticate);

// Income Categories routes
router.post('/income-categories', financeController.createIncomeCategory);
router.get('/income-categories', financeController.getIncomeCategories);
router.get('/income-categories/:id', financeController.getIncomeCategoryById);
router.put('/income-categories/:id', financeController.updateIncomeCategory);
router.delete('/income-categories/:id', financeController.deleteIncomeCategory);

// Income routes
router.post('/incomes', financeController.createIncome);
router.get('/incomes', financeController.getUserIncomes);
router.get('/incomes/:id', financeController.getIncomeById);
router.put('/incomes/:id', financeController.updateIncome);
router.delete('/incomes/:id', financeController.deleteIncome);

// Expense Categories routes
router.post('/expense-categories', financeController.createExpenseCategory);
router.get('/expense-categories', financeController.getExpenseCategories);
router.get('/expense-categories/:id', financeController.getExpenseCategoryById);
router.put('/expense-categories/:id', financeController.updateExpenseCategory);
router.delete('/expense-categories/:id', financeController.deleteExpenseCategory);

// Expense routes
router.post('/expenses', financeController.createExpense);
router.get('/expenses', financeController.getUserExpenses);
router.get('/expenses/:id', financeController.getExpenseById);
router.put('/expenses/:id', financeController.updateExpense);
router.delete('/expenses/:id', financeController.deleteExpense);

// Investment Simulation routes
router.post('/investment-simulations', financeController.createInvestmentSimulation);
router.get('/investment-simulations', financeController.getUserInvestmentSimulations);
router.get('/investment-simulations/:id', financeController.getInvestmentSimulationById);
router.delete('/investment-simulations/:id', financeController.deleteInvestmentSimulation);

// Dashboard routes
router.get('/dashboard', financeController.getDashboardData);

export default router;