# MusicDist - Music Distribution Platform Frontend

An Angular application for music distribution management, providing artists with tools to upload, track, and monetize their music releases.

## Overview

This Angular frontend application serves as the user interface for the Music Distribution Platform. It provides a comprehensive dashboard for artists to manage their music releases, track royalties, upload new content, and monitor their music's performance across various platforms.

**Backend Repository**: [artist-dashboard-backend](https://github.com/Gile987/artist-dashboard-backend)

## Features

- **Artist Dashboard**: Statistical overview with Chart.js visualizations (revenue line chart, revenue by release doughnut, top tracks bar chart)
- **Release Management**: Create, update, delete releases with title, release date, and cover URL
- **Track Management**: Upload individual audio files to releases with ISRC codes and automatic duration extraction
- **Royalty Tracking**: View royalty payments by artist and track with period-based calculations
- **File Upload**: Single audio file upload with validation (MP3, WAV, FLAC, AAC, OGG, WebM) and 50MB size limit
- **Admin Panel**: Admin-only interface to manage all artists, releases, and tracks with role-based access
- **User Registration**: Artist account creation with email/password authentication
- **Profile Management**: Update user name, email, and password
- **Authentication**: Cookie-based sessions with role-based guards (artist/admin)

## Technology Stack

- **Angular 19**: Standalone components with signals and reactive forms
- **TypeScript**: Strict type checking
- **SCSS**: Styling with variables, mixins, and dark theme
- **RxJS**: Reactive programming with BehaviorSubjects and observables
- **Chart.js**: Data visualization (line, doughnut, bar charts)
- **Google Material Icons**: Icon library for UI elements
- **Jasmine/Karma**: Unit testing framework

## Project Structure

```
src/
├── app/
│   ├── components/           # Feature-specific components
│   │   ├── release-item/     # Individual release display
│   │   ├── release-list/     # Release listing
│   │   ├── royalty-item/     # Individual royalty display
│   │   ├── royalty-list/     # Royalty listing
│   │   ├── track-item/       # Individual track display
│   │   └── track-list/       # Track listing
│   ├── core/                 # Core services and interfaces
│   │   ├── chart-configs/    # Chart.js configuration files
│   │   ├── guards/           # Route guards
│   │   ├── interfaces/       # TypeScript interfaces
│   │   │   ├── artist.interface.ts        # Artist with aggregated data
│   │   │   ├── auth.interface.ts          # User roles and login credentials  
│   │   │   ├── create-track-dto.interface.ts  # Track creation payload
│   │   │   ├── grouped-royalty.interface.ts   # Grouped royalty data
│   │   │   ├── release-dto.interface.ts       # Release creation payload
│   │   │   ├── release-stats.interface.ts     # Release statistics
│   │   │   ├── release-status.interface.ts    # PENDING/APPROVED/REJECTED
│   │   │   ├── release.interface.ts           # Release entity
│   │   │   ├── royalty-status.interface.ts    # paid/pending status
│   │   │   ├── royalty.interface.ts           # Royalty payments
│   │   │   ├── track.interface.ts             # Track with duration/ISRC
│   │   │   ├── upload.interface.ts            # File upload interfaces
│   │   │   └── user-profile.interface.ts      # User profile data
│   │   └── services/         # Business services
│   │       ├── admin.service.ts           # User management and artist data
│   │       ├── auth.service.ts            # Authentication and user state
│   │       ├── date-utils.service.ts      # Date formatting utilities
│   │       ├── file-validation.service.ts # Audio file validation
│   │       ├── release-stats.service.ts   # Release statistics
│   │       ├── release.service.ts         # Release CRUD operations
│   │       ├── royalty.service.ts         # Royalty data retrieval
│   │       ├── track.service.ts           # Track creation and management
│   │       ├── upload.service.ts          # File upload with signed URLs
│   │       └── url-utils.service.ts       # URL manipulation utilities
│   ├── layout/               # Application layout components
│   ├── routes/               # Feature route components
│   │   ├── admin/            # Admin panel - manage all users, releases, tracks
│   │   ├── dashboard/        # Statistics dashboard with Chart.js visualizations
│   │   ├── landing/          # Public landing page with feature overview
│   │   ├── login/            # Email/password authentication
│   │   ├── profile/          # User profile editing and password change
│   │   ├── register/         # Artist account registration
│   │   ├── releases/         # Release management with create/edit forms
│   │   ├── royalties/        # Royalty payments display
│   │   └── upload/           # Single audio file upload to releases
│   ├── shared/               # Reusable UI components
│   │   ├── button/           # Custom button with variants (primary/secondary)
│   │   ├── dropdown/         # Dropdown component for selections
│   │   ├── stat-card/        # Statistics display card with icons
│   │   ├── status-badge/     # Status indicator badge
│   │   ├── user-info-card/   # User information display card
│   │   └── pipes/            # Custom Angular pipes
│   │       ├── currency.pipe.ts    # Currency formatting (USD)
│   │       └── date-format.pipe.ts # Date formatting (short/long)
│   └── styles/               # Global styles and theming
│       ├── _variables.scss
│       ├── _mixins.scss
│       └── index.scss
└── public/                   # Public assets
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- Angular CLI 19+

### Installation

1. Clone and install:
   ```bash
   git clone https://github.com/Gile987/music-dist
   cd music-dist
   npm install
   ```

2. Configure environment:
   ```bash
   # Default API proxy is configured for http://localhost:3000
   ```

3. Start development:
   ```bash
   npm start              # Standard dev server
   # OR
   npm run start-proxy    # Dev server with API proxy to backend
   # Navigate to http://localhost:4200
   ```

## Development

### Available Scripts
```bash
npm start              # Start dev server
npm run start-proxy    # Start dev server with API proxy
npm test              # Run tests  
npm run build         # Production build
npm run watch         # Build in watch mode
npm run lint          # Run linting
```

### Key Architecture Features

- **Lazy Loading**: All routes use loadComponent() for code splitting
- **Route Guards**: authGuard redirects to /login, adminGuard requires 'admin' role
- **Signals**: Modern Angular reactivity with WritableSignal and computed signals
- **Cookie Authentication**: withCredentials: true for all HTTP requests
- **Chart.js Integration**: Direct Chart.js usage
- **File Upload**: Signed URL upload with XMLHttpRequest and progress tracking
- **Form Validation**: Reactive forms with built-in and custom validators
- **Dark Theme**: SCSS variables for consistent dark theme UI
- **Material Icons**: Google Material Icons for UI elements