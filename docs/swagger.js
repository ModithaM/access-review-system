const swaggerJsDoc = require('swagger-jsdoc');

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Access Review API',
            version: '1.0.0',
            description: 'API documentation',
        },
        servers: [
            {
                url: 'http://localhost:8888/api',
            },
        ],
        components: {
            securitySchemes: {
                xAuthToken: {
                    type: "apiKey",
                    in: "header",
                    name: "x-auth-token",
                },
            },
        },
    },
    apis: ['./routes/*.js'],
};

module.exports = swaggerJsDoc(swaggerOptions);