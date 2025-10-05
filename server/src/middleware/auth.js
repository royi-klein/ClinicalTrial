// Simple authentication middleware (like @PreAuthorize in Spring)

// Hardcoded user (for demo only)
const VALID_USER = {
  username: 'admin',
  password: 'admin123'  // In production, this would be hashed!
};

// Simple token store (in production, use JWT or sessions)
const validTokens = new Set();

// Generate a simple token (in production, use JWT)
function generateToken(username) {
  return `token_${username}_${Date.now()}_${Math.random().toString(36)}`;
}

// Login function
export function login(username, password) {
  if (username === VALID_USER.username && password === VALID_USER.password) {
    const token = generateToken(username);
    validTokens.add(token);
    return { success: true, token, username };
  }
  return { success: false, message: 'Invalid credentials' };
}

// Logout function
export function logout(token) {
  validTokens.delete(token);
  return { success: true, message: 'Logged out successfully' };
}

// Auth middleware - protects routes (like @PreAuthorize)
export function authenticate(req, res, next) {
  // Get token from Authorization header: "Bearer <token>"
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Missing or invalid authorization header' 
    });
  }

  const token = authHeader.substring(7); // Remove "Bearer " prefix

  if (!validTokens.has(token)) {
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Invalid or expired token' 
    });
  }

  // Token is valid, continue to the route handler
  next();
}

// Optional: Get current user from token
export function getCurrentUser(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  
  const token = authHeader.substring(7);
  if (validTokens.has(token)) {
    return { username: VALID_USER.username };
  }
  return null;
}