const { getTodos } = require('../routes/todoRoutes');

describe('getTodos function', () => {
    test('should return all todo items', () => {
        const mockConnection = {
            query: jest.fn().mockImplementation((sql, callback) => {
                callback(null, [{ id: 1, title: 'Test Todo', content: 'Test Content' }]);
            })
        };
        const req = {};
        const res = {
            json: jest.fn()
        };

        getTodos(mockConnection)(req, res);

        expect(res.json).toHaveBeenCalledWith([{ id: 1, title: 'Test Todo', content: 'Test Content' }]);
    });
});
