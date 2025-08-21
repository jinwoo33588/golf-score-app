function runSchema(schema, data) {
  if (!schema) return { value: data };
  // zod
  if (typeof schema.parse === 'function') {
    try {
      return { value: schema.parse(data) };
    } catch (e) {
      const issues = e.errors?.map(i => ({ path: i.path, message: i.message })) || [{ message: e.message }];
      const err = new Error('Validation failed');
      err.status = 400;
      err.details = issues;
      throw err;
    }
  }
  // joi
  if (typeof schema.validate === 'function') {
    const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: true });
    if (error) {
      const err = new Error('Validation failed');
      err.status = 400;
      err.details = error.details?.map(d => ({ path: d.path, message: d.message }));
      throw err;
    }
    return { value };
  }
  // 스키마가 없거나 미지원 타입이면 그대로 통과
  return { value: data };
}

function validateBody(schema) {
  return (req, res, next) => {
    try {
      const { value } = runSchema(schema, req.body);
      req.body = value;
      next();
    } catch (err) { next(err); }
  };
}
function validateQuery(schema) {
  return (req, res, next) => {
    try {
      const { value } = runSchema(schema, req.query);
      req.query = value;
      next();
    } catch (err) { next(err); }
  };
}
function validateParams(schema) {
  return (req, res, next) => {
    try {
      const { value } = runSchema(schema, req.params);
      req.params = value;
      next();
    } catch (err) { next(err); }
  };
}

module.exports = { validateBody, validateQuery, validateParams };
