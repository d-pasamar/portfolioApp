# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog
and this project follows Semantic Versioning.

## [0.11.0] - 2026-06-04

### Added

- `ProfilePage` with editable name field and read-only fields (email, role, member since)
- `services/users.js` with `updateUserName` and `deleteUserAccount` functions
- `useProfile` hook encapsulating profile edit and account deletion logic
- Danger zone section with account deletion via Supabase Edge Function (`delete-account`)
- `formatDate` utility in `format.js` for formatting arbitrary date strings

### Changed

- `deleteUserAccount` now calls Edge Function `/functions/v1/delete-account` instead of direct REST delete, enabling proper `auth.users` cleanup with CASCADE

## [0.10.0] - 2026-06-04

### Added

- Added individual asset price sync button (🔄) in each AssetRow alongside kebab menu
- Added bulk price sync with cost warning in usePortfolioDetail (replaces simulation)
- Added last sync timestamp display in portfolio StatCard subtitle
- Added EODHD API calls counter badge in navbar (auto-refreshes after sync)
- Added Vite proxy configuration for EODHD API to avoid CORS issues
- Created `EditAssetModal` component for inline editing of quantity and buy price
- Added `getLatestPricesBulk` and `getSyncCost` functions to eodhdClient for batch sync

### Changed

- Reduced cache TTL from 24 hours to 5 minutes for more responsive price updates
- Replaced simulated `handleSyncPrices` with real EODHD bulk sync in usePortfolioDetail
- Replaced prompt-based asset editing with EditAssetModal component
- Changed sync timestamp to record moment of user action instead of market timestamp

## [0.9.0] - 2026-06-03

### Added

- Created `eodhdClient.js` service with real-time pricing endpoint, 24h cache strategy, and API usage check
- Created `assetsReference.js` service for local catalog search (users) and EODHD sync (admins)
- Created `syncLog.js` service for sync audit trail (getLastSync, logSync)
- Created `useMarketSearch` custom hook with debounced search, portfolio loading, and add-to-portfolio action
- Created `MarketSearchPage` as declarative orchestrator consuming useMarketSearch hook
- Created `MarketResultsTable` component for search results display with "+ Añadir" button per row
- Created `AddAssetModal` component with portfolio selector, quantity, and buy price fields

### Fixed

- Fixed empty response error in `addAssetToPortfolio` by adding `Prefer: return=representation` header

## [0.8.0] - 2026-06-03

### Added

- Created `useDashboardData` custom hook to encapsulate Supabase queries and financial logic
- Created centralized `format.js` utility file for global currency and date formatting
- Created `usePortfolioDetail` custom hook to isolate portfolio loading and financial metrics calculation
- Created `useAssetsCRUD` custom hook for asset edit and delete operations with automatic list refresh
- Created `AssetsTable` component for financial assets table rendering
- Created `AssetRow` component with kebab menu (⋮) for inline edit and delete actions
- Added "+ Añadir Activo" navigation button in portfolio detail header

### Changed

- Refactored `DashboardPage` into a lightweight, purely declarative presentation component
- Decoupled table row rendering into an independent `DashboardTableRow` component
- Refactored `PortfolioDetailPage` into a declarative component consuming custom hooks and subcomponents
- Replaced hardcoded metric cards in portfolio detail with reusable `StatCard` component
- Replaced inline `toLocaleString` calls with centralized `formatEUR` utility in asset components

### Fixed

- Fixed typo in assets service: `/reset/v1/assets` → `/rest/v1/assets` in `addAssetToPortfolio`

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
