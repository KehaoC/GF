# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Mixboard clone - a visual canvas application for creating collages and mood boards with AI-powered image generation. The project consists of:

- **Frontend**: React + TypeScript + Vite (located in `/web`)
- **Backend**: FastAPI + Python (to be implemented)

## Development Commands

All frontend commands should be run from the `/web` directory:

```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Architecture

### Frontend Structure (`/web`)

The app uses **HashRouter** for client-side routing with two main pages:

1. **Dashboard** (`/`) - Project gallery view
2. **Editor** (`/project/:id`) - Canvas workspace for editing projects

### Key Architectural Patterns

**State Management**:
- Local component state with React hooks (no Redux/Context)
- `elements` array holds all canvas items (images, text)
- `viewport` object manages pan/zoom state `{x, y, scale}`
- `selectedIds` Set tracks multi-selection

**Canvas Coordinate System**:
- The `screenToCanvas()` function converts screen coordinates to canvas space accounting for viewport pan/zoom
- All element positions are in canvas coordinates, not screen pixels
- Transform is applied via CSS: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`

**Element Interaction**:
- Click on canvas background deselects all
- Shift+click toggles element selection
- Drag while `activeTool === 'select'` moves elements
- Middle mouse or Hand tool enables panning
- Ctrl/Cmd+scroll for zoom

**AI Integration** (`services/geminiService.ts`):
- Currently uses mock implementation returning random Picsum images
- Real implementation should use `@google/genai` SDK
- API key injected via Vite's `define` from `GEMINI_API_KEY` env var
- Functions: `generateImageFromPrompt()` and `transformElement()`

### Type System (`types.ts`)

Core types:
- `CanvasElement` - Base canvas item (image or text)
- `Project` - Container for elements with metadata
- `Viewport` - Pan/zoom state
- `Tool` - Active tool type ('select' | 'hand' | 'text')

### Important Implementation Details

**Vite Configuration**:
- Dev server runs on port 3000 (not default 5173)
- Exposes API key as both `process.env.API_KEY` and `process.env.GEMINI_API_KEY`
- Uses path alias `@` for root directory

**Styling**:
- Tailwind CSS via CDN (configured in `index.html`)
- Custom theme colors: `mix.bg`, `mix.accent`, etc.
- Dot grid background pattern defined in inline styles

**Data Persistence**:
- Currently using `MOCK_PROJECTS` constant (no real persistence)
- Backend API integration pending

## Environment Setup

Create `.env.local` in the `/web` directory:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

## AI Studio Integration

This app is designed to work with Google AI Studio. See the web README for the studio link.
