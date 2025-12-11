# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Guru - a visual canvas application for creating collages and mood boards with AI-powered image generation. The project consists of:

- **Frontend**: React + TypeScript + Vite (`/web`)
- **Backend**: FastAPI + Python (`/backend`)

## Development Commands

### Frontend (`/web`)

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Build for production
npm run preview      # Preview production build
```

### Backend (`/backend`)

```bash
pip install -r requirements.txt   # Install dependencies
python run.py                     # Start dev server (http://localhost:8000)
```

API docs available at `http://localhost:8000/api/v1/docs`

## Architecture

### Frontend Structure (`/web`)

Uses **HashRouter** with two main pages:
1. **Dashboard** (`/`) - Project gallery view
2. **Editor** (`/project/:id`) - Canvas workspace

**State Management**:
- Local component state with React hooks (no Redux/Context)
- `elements` array holds all canvas items (images, text)
- `viewport` object manages pan/zoom `{x, y, scale}`
- `selectedIds` Set tracks multi-selection

**Canvas Coordinate System**:
- `screenToCanvas()` converts screen coordinates to canvas space
- All element positions are in canvas coordinates, not screen pixels
- Transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`

**Element Interaction**:
- Click background deselects all; Shift+click toggles selection
- Drag with `activeTool === 'select'` moves elements
- Middle mouse or Hand tool enables panning
- Ctrl/Cmd+scroll for zoom

**AI Integration** (`services/geminiService.ts`):
- Mock implementation returning random Picsum images
- Real implementation uses `@google/genai` SDK
- Functions: `generateImageFromPrompt()`, `transformElement()`

### Backend Structure (`/backend`)

Standard FastAPI layered architecture:

```
app/
├── api/v1/           # Route handlers (auth, projects, users)
├── core/             # Security (JWT, bcrypt) and dependencies
├── models/           # SQLAlchemy ORM models
├── schemas/          # Pydantic request/response schemas
├── config.py         # Settings via pydantic-settings
├── database.py       # SQLAlchemy engine and session
└── main.py           # FastAPI app initialization
```

**Key Patterns**:
- JWT authentication via `python-jose`, passwords hashed with `bcrypt`
- `get_current_user` dependency in `core/deps.py` extracts user from Bearer token
- Project `elements` stored as JSON column (mirrors frontend `CanvasElement[]`)
- All routes prefixed with `/api/v1`

**API Endpoints**:
- Auth: `POST /auth/register`, `POST /auth/login`
- Users: `GET /users/me`, `PUT /users/me`
- Projects: CRUD at `/projects/`, plus `GET /projects/examples`

**Database**:
- SQLite by default (`guru.db`), configurable via `DATABASE_URL`
- Tables auto-created on startup via `Base.metadata.create_all()`

## Environment Setup

### Frontend (`/web/.env.local`)
```
GEMINI_API_KEY=your_gemini_api_key_here
```

### Backend (`/backend/.env`)
```
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///./guru.db
```

## Type System

**Frontend** (`types.ts`):
- `CanvasElement` - Base canvas item (image or text)
- `Project` - Container for elements with metadata
- `Viewport` - Pan/zoom state
- `Tool` - 'select' | 'hand' | 'text'

**Backend** - Pydantic schemas mirror frontend types; `Project.elements` is `List[dict]` (JSON)
