const swaggerJsDoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Access Review API',
      version: '1.0.0',
      description: 'API documentation',
    },
    servers: [
      {
        url: '/api',
      },
    ],
    components: {
      securitySchemes: {
        xAuthToken: {
          type: 'apiKey',
          in: 'header',
          name: 'x-auth-token',
        },
      },
      schemas: {
        ReviewFeature: {
          type: 'object',
          properties: {
            featureName: { type: 'string', example: 'Wheelchair Ramp' },
            available: { type: 'boolean', example: true },
            condition: {
              type: 'string',
              enum: ['excellent', 'good', 'fair', 'poor', 'not_available'],
              example: 'good',
            },
          },
        },
        AccessibilityReview: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '65fe2f4f1b6ebf1939b5f192' },
            spaceId: { type: 'string', example: '65fe2f4f1b6ebf1939b5f180' },
            userId: { type: 'string', example: '65fe2f4f1b6ebf1939b5f181' },
            rating: { type: 'number', minimum: 1, maximum: 5, example: 4 },
            title: { type: 'string', example: 'Very accessible place' },
            comment: {
              type: 'string',
              minLength: 10,
              maxLength: 1000,
              example: 'Well-maintained ramps and clear tactile paving throughout the entrance.',
            },
            features: {
              type: 'array',
              items: { $ref: '#/components/schemas/ReviewFeature' },
            },
            removed: { type: 'boolean', example: false },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            pages: { type: 'integer', example: 3 },
            count: { type: 'integer', example: 24 },
          },
        },
        ApiError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            result: { nullable: true },
            message: { type: 'string', example: 'Validation failed' },
          },
        },
      },
    },
  },
  apis: ['./routes/*.js'],
};

module.exports = swaggerJsDoc(swaggerOptions);
