# HUDOC API Wrapper Design Guidelines

## Design Approach
**Selected System**: GitHub Primer Design System
**Justification**: Developer-focused tool requiring clarity, technical precision, and familiar patterns for API documentation and testing interfaces.

## Core Design Elements

### Typography
**Font Family**: 
- Primary: Inter (via Google Fonts CDN)
- Code/Monospace: Fira Code

**Hierarchy**:
- Page Titles: text-4xl font-bold
- Section Headers: text-2xl font-semibold
- Subsections: text-lg font-medium
- Body Text: text-base font-normal
- Code/API Endpoints: text-sm font-mono
- Captions/Labels: text-xs font-medium uppercase tracking-wide

### Layout System
**Spacing Units**: Tailwind units of 3, 4, 6, 8, 12, 16
- Component padding: p-6 or p-8
- Section spacing: py-12 or py-16
- Card gaps: gap-6
- Inline spacing: space-x-3 or space-x-4

**Container Strategy**:
- Documentation content: max-w-6xl mx-auto
- Code examples: max-w-4xl
- API endpoint cards: max-w-5xl
- Two-column docs layout: 60/40 split (content/sidebar)

### Component Library

#### Navigation
- Sticky top navigation with logo, main sections, search bar
- Left sidebar navigation for API documentation sections (sticky, scrollable)
- Breadcrumb trail below header for deep navigation

#### Documentation Components
- **Endpoint Cards**: Method badge (GET/POST), endpoint path, description, expandable request/response examples
- **Code Blocks**: Syntax-highlighted with copy button, language selector tabs (cURL, JavaScript, Python)
- **Parameter Tables**: Name, type, required badge, description columns
- **Response Examples**: Collapsible JSON viewers with proper indentation

#### Interactive Elements
- **API Explorer**: Live request builder with form inputs for parameters, "Try It" button, response viewer
- **Search Bar**: Full-width with keyboard shortcut hint, real-time suggestions
- **Filter Panel**: Checkbox groups for case filtering (country, article, importance)
- **Pagination Controls**: Previous/Next buttons with page numbers, results per page selector

#### Data Display
- **Case Results Grid**: Card layout with case title, application number, date, judgment summary preview
- **Case Detail View**: Two-column layout with metadata sidebar and full judgment text
- **Status Indicators**: Badges for violation/non-violation, importance levels
- **Stats Dashboard**: Metric cards showing API usage, cache hit rate, response times

#### Forms & Inputs
- Text inputs with floating labels
- Dropdown selectors with search functionality
- Date range pickers for filtering
- Toggle switches for boolean filters
- All inputs include clear validation states and helpful error messages

### Page Layouts

#### Homepage/Dashboard
- Hero section (h-96): Clean headline, API status indicator, quick start CTA
- Three-column feature grid: Search capabilities, filtering options, GPT optimization
- Quick reference code snippet section
- Getting started guide preview

#### API Documentation
- Two-column layout: Fixed sidebar navigation (w-64) + scrollable content area
- Grouped endpoints by resource type (Cases, Search, Filters)
- Each endpoint section includes authentication requirements, rate limits

#### Interactive Explorer
- Single-column centered layout (max-w-4xl)
- Top: Request builder form
- Middle: Submit button and loading state
- Bottom: Split-view response (formatted JSON + raw)

### Visual Patterns
- Consistent card elevations: subtle border, no shadows
- Rounded corners: rounded-lg for cards, rounded-md for buttons/inputs
- Dividers: border-t border-b for section separation
- Monospace for all technical content (endpoints, parameters, code)
- Badge components for status, methods, required fields

### Animations
Minimal, performance-focused:
- Sidebar collapse/expand transition
- Code block copy confirmation (checkmark fade)
- Smooth scroll to anchor links in documentation

## Images
No hero image required. This is a technical documentation site where clarity and information density take priority over visual imagery. Include only:
- Logo/brand mark in navigation
- Diagram illustrations for API flow/architecture (if beneficial)
- Icons for endpoint methods (GET, POST, etc.) and status indicators