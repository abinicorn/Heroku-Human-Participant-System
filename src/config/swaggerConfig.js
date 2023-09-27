import swaggerJSDoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'StudyFusion',
            version: '1.0.0',
            description: 'StudyFusion backend API',
        },
    },
    apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

// module.exports = swaggerSpec;

export {swaggerSpec}