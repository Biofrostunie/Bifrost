import swaggerJsdoc from 'swagger-jsdoc';
import { version } from '../../package.json';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Bifrost API',
      version,
      description: 'API for Bifrost - Financial Education and Management System',
      license: {
        name: 'MIT',
      },
      contact: {
        name: 'API Support',
        email: 'support@bifrost.com',
      },
    },
    servers: [
      {
        url: '/api/v1',
        description: 'API v1',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          required: ['email', 'name', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
            },
            name: {
              type: 'string',
            },
            password: {
              type: 'string',
              format: 'password',
            },
          },
        },
        Login: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
            },
            password: {
              type: 'string',
              format: 'password',
            },
          },
        },
        Income: {
          type: 'object',
          required: ['amount', 'date', 'categoryId'],
          properties: {
            amount: {
              type: 'number',
              format: 'float',
            },
            description: {
              type: 'string',
            },
            date: {
              type: 'string',
              format: 'date-time',
            },
            categoryId: {
              type: 'string',
              format: 'uuid',
            },
          },
        },
        Expense: {
          type: 'object',
          required: ['amount', 'date', 'categoryId'],
          properties: {
            amount: {
              type: 'number',
              format: 'float',
            },
            description: {
              type: 'string',
            },
            date: {
              type: 'string',
              format: 'date-time',
            },
            categoryId: {
              type: 'string',
              format: 'uuid',
            },
          },
        },
        Category: {
          type: 'object',
          required: ['name'],
          properties: {
            name: {
              type: 'string',
            },
            description: {
              type: 'string',
            },
          },
        },
        FinancialConcept: {
          type: 'object',
          required: ['title', 'content', 'tags'],
          properties: {
            title: {
              type: 'string',
            },
            content: {
              type: 'string',
            },
            tags: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
          },
        },
        InvestmentSimulation: {
          type: 'object',
          required: ['initialAmount', 'monthlyContribution', 'interestRate', 'timeframeYears'],
          properties: {
            initialAmount: {
              type: 'number',
              format: 'float',
            },
            monthlyContribution: {
              type: 'number',
              format: 'float',
            },
            interestRate: {
              type: 'number',
              format: 'float',
            },
            timeframeYears: {
              type: 'integer',
            },
            compoundingFrequency: {
              type: 'string',
              enum: ['daily', 'monthly', 'quarterly', 'annually'],
              default: 'monthly',
            },
            name: {
              type: 'string',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);