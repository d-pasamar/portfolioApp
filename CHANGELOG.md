# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog
and this project follows Semantic Versioning.

## [0.7.0] - 2026-06-02

### Added

- Assets service with native Supabase REST API CRUD operations
- Portfolio management page with dedicated user interface
- Native CRUD actions menu using a vertical dots dropdown pattern for portfolio management
- Portfolio detail page featuring live financial metrics, cost basis, and conditional formatting (profit/loss)
- Native support for a "Watchlist" mode (tracking assets with zero quantity/price without breaking financial formulas)
- Isolated `DashboardTableRow` component in the common folder for better modularity

### Changed

- Expanded application architecture to support asset management operations
- Improved portfolio management experience with contextual action menus
- Migrated database schema to natively include `buy_price` in the `assets` table
- Updated assets service to map and handle the new `buy_price` field

## [0.6.0] - 2026-06-02

### Added

- Dashboard page visual mockup based on the approved Figma design
- Portfolio service with native Supabase REST API CRUD operations
- Automatic default portfolio creation during user registration
- Initial portfolio management integration in the dashboard
- Reusable `StatCard`component for dashboard metrics display

### Changed

- Connected dashboard data layer to the portfolio service
- Enhanced registration flow with automatic portfolio provisioning
- Updated dashboard to load user portfolio data from the backend

## [0.5.0] - 2026-06-01

### Added

- Shared application layout component (`Layout.jsx`)
- Reussable navigation bar for authenticated sections
- Dynamic navigation rendering based on authentication state
- User profile display in navigation interface

### Changed

- Updated router configuration to use the shared layout structure
- Improved application navigation consistency across pages
- Enhanced user experience in navigation interface
- Refactored dashboard metrics section to use reusable StatCard components

## [0.4.0] - 2026-06-01

### Added

- Global authentication state management using React Context API
- AuthProvider component for application-wide session handling
- Initial loading state during session verification
- ProtectedRoute component for route access control
- Register page structure and initial form layout
- Login page structure and initial form layout

### Changed

- Improved authentication architecture with centralized auth context
- Updated routing configuration to support authenticated and unanthenticated access

## [0.3.0] - 2026-05-27

### Added

- Supabase REST API client service
- Authentication service with signUp, signIn and signOut
- JWT session persistence using localStorage
- Automatic Authorization and API headers handling
- Centralized API error handling

### Changed

- Improved fetch service with dynamic headers and FormData support
- Enhanced authentication flow and session management

## [0.2.0] - 2026-05-27

### Added

- Initial application routing with React Router
- Public and private page structure
- Tailwind CSS v4 integration
- Vitest testing setup

### Changed

- Added explanatory comments to Vitest configuration

## [0.1.0] - 2026-05-27

### Added

- Initial project setup with Vite and React
- Initial folder structure
- GitHub repository setup
- Tailwind CSS configuration
- React Router installation and initial routes
