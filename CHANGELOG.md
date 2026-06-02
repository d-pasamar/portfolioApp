# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog
and this project follows Semantic Versioning.

## [unreleased]

### Added

### Changed

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
