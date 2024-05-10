const request = require('supertest');
const app = require('../app');

describe('GET /todo', () => {
    test('should get all todo items', async () => {
        const response = await request(app).get('/read');
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });
});