// Main Components Export
// Features
export * from './features/notifications';
export * from './features/orders';
export * from './features/products';
export * from './features/profile';
export * from './features/dashboard';
export * from './features/analytics';
export * from './features/market';
export * from './features/consultation';
export * from './features/jobs';

// Authentication
export * from './auth';

// Shared Components
export * from './shared/ui';
export * from './shared/common';
export * from './shared/navigation';

// Layouts
export * from './layouts';

// Pages (keep existing structure for now)
export { default as Home } from './pages/Home.jsx';

// Explicit export for SavedAnalyses to fix the import issue
export { SavedAnalyses } from './features/analytics';
