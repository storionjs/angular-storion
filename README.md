# angular-storion

A simple Angular (v21) TODO app that uses the [storion](https://github.com/your-org/storion) client-side database for CRUD operations. Data is stored in **localStorage**.

## Features

- **Create** – Add new todos
- **Read** – List all todos (sorted by id)
- **Update** – Edit title, toggle completed
- **Delete** – Remove a todo

All data persists in the browser via storion’s localStorage backend.

## Prerequisites

- Node.js 18+
- The `storion` package (local: `../storion` or install from npm when published)

## Setup

```bash
# Install dependencies (storion is linked from ../storion)
npm install

# Serve the app
npm start
```

Open http://localhost:4200

## Build

```bash
npm run build
```

Output is in `dist/angular-storion/`.

## How it works

- **TodoService** (`src/app/todo.service.ts`) uses `createDatabase()` from storion to open (or create) a database named `angular-storion-todos` in localStorage. It ensures a `todos` table exists with columns `id`, `title`, and `completed`, then exposes:
  - `addTodo(title)`, `updateTodo(id, patch)`, `deleteTodo(id)`, `toggleCompleted(id)`
  - Reactive state via Angular signals (`todos`, `isReady`, `completedCount`, `activeCount`).
- The **App** component provides the UI: input + Add button, list with checkboxes (toggle), inline edit (Edit → change text → Save/Cancel), and Delete. Footer shows active/completed counts.

## Project structure

```
src/
  app/
    app.ts          # Root component and TODO UI logic
    app.html
    app.css
    todo.service.ts # Storion DB init and CRUD
  main.ts
  index.html
```

## License

MIT
