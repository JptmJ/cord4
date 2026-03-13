import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7);
  const cookie = request.headers.get('cookie');
  if (cookie) {
    const match = cookie.match(/token=([^;]+)/);
    if (match) return match[1];
  }
  return null;
}

export function requireAuth(request) {
  const token = getTokenFromRequest(request);
  if (!token) return { error: 'Unauthorized', status: 401 };
  const user = verifyToken(token);
  if (!user) return { error: 'Invalid or expired token', status: 401 };
  return { user };
}

export function requireRole(request, ...roles) {
  const result = requireAuth(request);
  if (result.error) return result;
  if (!roles.includes(result.user.role)) {
    return { error: `Access denied. Required role: ${roles.join(' or ')}`, status: 403 };
  }
  return result;
}
