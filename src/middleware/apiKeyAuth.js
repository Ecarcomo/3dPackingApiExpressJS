/**
 * Valida API_KEY si está definida en el entorno (process.env.API_KEY).
 * Acepta el valor en el header x-api-key o Authorization: Bearer <clave>.
 * Si API_KEY no está definida o está vacía, no se exige clave (útil en desarrollo).
 */
function apiKeyAuth(req, res, next) {
  const expected = process.env.API_KEY;
  if (expected === undefined || String(expected).trim() === '') {
    return next();
  }

  const fromHeader =
    req.get('x-api-key') ||
    req.get('X-API-Key') ||
    '';
  const auth = req.get('authorization') || '';
  const bearer =
    auth.startsWith('Bearer ') || auth.startsWith('bearer ')
      ? auth.slice(7).trim()
      : '';
  const provided = fromHeader || bearer;

  if (!provided || provided !== expected) {
    res.status(401).json({
      error: 'unauthorized',
      message: 'API key inválida o ausente.',
    });
    return;
  }

  next();
}

module.exports = apiKeyAuth;
