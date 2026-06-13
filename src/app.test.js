const request = require('supertest');
const app = require('./app');

describe('app.js — configuration Express', () => {
  describe('Test 404 handler', () => {
    it('devrait répondre 404 sur une route inconnue', async () => {
      const res = await request(app).get('/route-inexistante');
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ success: false, error: 'Route not found' });
    });

    it('devrait répondre 404 quelle que soit la méthode HTTP', async () => {
      const res = await request(app).post('/route-inexistante');
      expect(res.status).toBe(404);
    });
  });

  describe('Test middleware JSON', () => {
    it('devrait rejetter un body JSON malformé avec un 400', async () => {
      const res = await request(app)
        .post('/api/recipes')
        .send('{ name: invalide }')
        .set('Content-Type', 'application/json');
      expect(res.status).toBe(400);
    });
  });
});
