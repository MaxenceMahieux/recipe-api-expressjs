const errorHandler = require('./errorHandler');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockReq = (overrides = {}) => ({
  params: {},
  query: {},
  body: {},
  ...overrides,
});

describe('Test du error handler', () => {
  it('Devrait retourner une 500', () => {
    const req = mockReq();
    const res = mockRes();

    errorHandler({}, req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
