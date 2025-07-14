// Authentication Components
export { default as LoginForm } from './forms/Login.jsx';
export { default as AdminLogin } from './forms/AdminLogin.jsx';
export { default as ProtectedRoute } from './guards/ProtectedRoute.jsx';
export { default as AdminProtectedRoute } from './guards/AdminProtectedRoute.jsx';

// Re-export for easier imports
export * from './forms/Login.jsx';
export * from './forms/AdminLogin.jsx';
export * from './forms/RegistrationOptions.tsx';
export * from './guards/ProtectedRoute.jsx';
export * from './guards/AdminProtectedRoute.jsx';
