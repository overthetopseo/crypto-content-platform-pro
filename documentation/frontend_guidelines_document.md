# Frontend Guideline Document for Crypto Content Platform Pro

This document outlines the frontend setup, design principles, and technologies used in the Crypto Content Platform Pro. It is written in everyday language so that anyone—technical or not—can understand how the frontend is built and maintained.

## 1. Frontend Architecture

### 1.1 Overall Structure
- The project is built with **Next.js (version 13+)**, using its App Router to manage pages, layouts, and server-side logic.  
- **React** powers all of our user interface components.  
- We leverage **Next.js API Routes** to handle serverless endpoints (for example, the `/api/webhooks` route) without a separate backend service.  

### 1.2 Scalability and Maintainability
- **File-based routing**: Each folder under `/app` becomes a route. This keeps navigation clear as the app grows.  
- **API routes co-located** with UI code: Backend logic lives alongside frontend code, reducing context switching.  
- **Modular components** (see Section 4) ensure we can add or update features without touching the entire codebase.  

### 1.3 Performance Benefits
- **Server-Side Rendering (SSR)** and **Static Site Generation (SSG)** (where appropriate) deliver fast initial load times and strong SEO.  
- Out-of-the-box code splitting: Next.js automatically splits JavaScript into smaller bundles so users download only what they need.  
- Built-in optimizations like the `next/image` component for responsive, lazily loaded images.

## 2. Design Principles

### 2.1 Usability
- Clear navigation and consistent layouts help users find content quickly.  
- Simple, uncluttered interfaces focus attention on the main goal—reading or creating crypto content.

### 2.2 Accessibility
- All interactive elements (buttons, links, form fields) follow WCAG color-contrast standards.  
- Semantic HTML tags (like `<main>`, `<nav>`, `<header>`, `<article>`) ensure screen readers can navigate efficiently.  
- Keyboard navigation is fully supported for major features (editor controls, menus, scheduling tools).

### 2.3 Responsiveness
- The design adapts to desktop, tablet, and mobile screens using CSS media queries and flexible layouts.  
- Breakpoints are set at 320px, 768px, and 1024px to cover the majority of devices.

## 3. Styling and Theming

### 3.1 Styling Approach
- We use **CSS Modules** for component-scoped styles, combined with a global stylesheet (`globals.css`) for shared rules.  
- No pre-processor is currently needed, keeping the setup simple. If advanced nesting or variables become essential, we may introduce **SASS** later.

### 3.2 Design Style
- A **modern flat** design with subtle **glassmorphism** effects on cards and panels to give a crypto feel.  
- Clean edges, minimal shadows, and smooth transitions keep the interface fresh and professional.

### 3.3 Color Palette
| Purpose       | Light Mode       | Dark Mode        |
|---------------|------------------|------------------|
| Background    | #F7FAFC (light)  | #1A202C (dark)   |
| Surface Cards | rgba(255,255,255,0.6) | rgba(26,32,44,0.6) |
| Primary Text  | #2D3748          | #E2E8F0          |
| Secondary Text| #4A5568          | #A0AEC0          |
| Accent        | #38B2AC (teal)   | #38B2AC          |
| Highlight     | #F6E05E (yellow) | #D69E2E          |

### 3.4 Typography
- **Primary Font**: "Geist VF" for headings and body text.  
- **Monospace Font**: "Geist Mono VF" for code snippets and editor areas.  
- Fallback fonts: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif`.

## 4. Component Structure

### 4.1 Folder Organization
- `/components/` – houses all reusable components, organized by feature or atomic level:
  - `atoms/` (buttons, inputs, tags)
  - `molecules/` (cards, nav items)
  - `organisms/` (headers, footers, content blocks)
  - `templates/` (page shells)  
- Each component lives in its own folder with:
  - `ComponentName.tsx` (React code)
  - `ComponentName.module.css` (styles)
  - `ComponentName.test.tsx` (unit tests)

### 4.2 Reusability and Maintainability
- Components accept clearly defined **props** so they adapt to different contexts.  
- Shared utility functions (formatters, date helpers) live in `/utils` to avoid duplication.

## 5. State Management

### 5.1 Client State
- We use **React Context API** for global UI state (theme mode, user authentication status).  
- Local component state (`useState`, `useReducer`) handles form inputs and ephemeral UI toggles.

### 5.2 Server Data
- **React Query** (aka TanStack Query) manages data fetching, caching, and updating server-sourced data (articles, scheduled posts).  
- This ensures consistent loading states, automatic refetching on focus, and a snappy user experience.

## 6. Routing and Navigation

### 6.1 File-Based Routing
- All routes map directly to folders and files under `/app`. For example:
  - `/app/layout.tsx` wraps every page with header and footer.  
  - `/app/page.tsx` renders the home screen.  
  - `/app/articles/[id]/page.tsx` handles dynamic article pages.

### 6.2 Navigation Structure
- A top navigation bar with links to Home, Create Content, Manage Posts, and Settings.  
- Breadcrumbs on deeper pages (e.g., Article ▶ Edit) help users understand their location.

## 7. Performance Optimization

- **Dynamic Imports**: Heavy components (like the rich text editor) are loaded only when needed.  
- **Image Optimization**: Using `next/image` to serve the right image size for each device.  
- **Caching**: Static pages and API responses use intelligent caching headers.  
- **Minification & Compression**: JavaScript and CSS are minified at build time; assets are gzipped or Brotli-compressed.

## 8. Testing and Quality Assurance

### 8.1 Unit and Integration Tests
- **Jest** with **React Testing Library** for component tests and utility functions.  
- Tests live alongside code in `*.test.tsx` files to keep testing context close.

### 8.2 End-to-End Tests
- **Cypress** automates critical user flows: logging in, creating content, and previewing posts.

### 8.3 Linting and Formatting
- **ESLint** enforces code style and catches common errors.  
- **Prettier** automatically formats code on save or commit.  
- **Husky** pre-commit hooks run linting and tests to maintain code quality.

## 9. Conclusion and Overall Frontend Summary

Crypto Content Platform Pro’s frontend is powered by Next.js and React, combining server-side rendering, modular components, and sensible conventions to deliver a fast, accessible, and scalable user experience. Our design principles ensure the app is easy to use, looks modern, and adapts across devices. With clear component boundaries, robust state management, and a thorough testing setup, the platform is ready to evolve alongside the fast-paced world of cryptocurrency content creation.

By following these guidelines, new and existing team members can build features confidently, maintain a cohesive design, and keep performance and user experience top of mind.