# NexusDrive

A premium, highly-performant browser-based file explorer built with React, Next.js, and TypeScript. Designed to emulate native desktop file management workflows with uncompromising UI/UX, true responsive layouts, and a sophisticated client-side state engine.

## 🚀 Project Overview

The NexusDrive is a state-of-the-art web application that allows users to create, navigate, rename, delete, and edit files and folders seamlessly. Built upon modern minimalist design principles, it features deep dark-mode aesthetics, micro-animations, keyboard shortcuts, and a robust architecture capable of handling deeply nested folder structures without performance degradation.

---

## 🛠️ Tech Stack

This project leverages a modern, robust, and strongly-typed ecosystem:
- **Framework:** React 18 & Next.js 14 (App Router)
- **Language:** TypeScript (Strict Mode)
- **Styling:** TailwindCSS
- **Components:** Shadcn UI & Radix UI Primitives
- **Icons:** Lucide React
- **State Management:** React Context API + LocalStorage (Persisted)

---

## 🏗️ Folder Structure

The repository is modularly organized by feature domains rather than purely by file type, ensuring highly cohesive and decoupled modules:

```text
NexusDrive/
├── src/
│   ├── app/                    # Next.js App Router (Layouts & Pages)
│   ├── components/             # React Components
│   │   ├── FileExplorer/       # Core Domain: File Explorer
│   │   │   ├── Editor/         # Text Editor Workspace (Module 5)
│   │   │   ├── MainPanel/      # Grid, Breadcrumbs, Actions (Module 4)
│   │   │   └── Sidebar/        # Tree View Navigation (Module 3)
│   │   └── ui/                 # Reusable Shadcn UI primitives
│   ├── context/                # Global State Providers (FileSystemContext)
│   ├── hooks/                  # Custom Hooks (useFileSystemState)
│   ├── lib/                    # Utility functions (Tailwind merges, etc.)
│   └── types/                  # Global TypeScript Interfaces
├── public/                     # Static assets
└── package.json                # Dependencies and scripts
```

---

## ⚙️ Project Setup

Follow these steps to run the file explorer locally on your machine:

1. **Clone the repository**
   ```bash
   git clone https://github.com/mehediakash01/NexusDrive.git
   cd NexusDrive
   ```

2. **Install dependencies**
   Ensure you have Node.js installed (v18+ recommended).
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🧠 Data Architecture & State Engine

Unlike traditional file trees that rely on deeply nested recursive objects (which become exponentially slower to traverse and mutate), this project utilizes a **Normalized Flat State Object**.

```typescript
export type FileSystemState = { [id: string]: FileNode };
```

**Why Normalization?**
- **O(1) Lookups & Mutations:** Fetching, updating, or deleting any node requires exactly one dictionary lookup. No deep recursive state mapping.
- **Relational Integrity:** Parent-child relationships are mapped via a `parentId` pointer, functioning exactly like a relational database table.
- **Immutability without lag:** Updating a nested child doesn't require cloning its entire ancestry tree.

---

## 🛡️ Algorithmic Edge Cases Handled

- **Breadth-First Search (BFS) Deletion Stack:** Deleting a folder recursively deletes all its descendants in a single, predictable pass using an iterative BFS queue. This prevents orphaned records and avoids call-stack limits associated with deep recursion.
- **Collision Protection:** Creating a new file or folder automatically checks sibling nodes for name collisions. If a conflict is found, the system defensively resolves it by appending `(New)`.
- **Defensive Tracking Views:** Deleting a node that the user is currently viewing (e.g., deleting an open file or an active folder) defensively resets the `currentFolderId` or `openFileId` to a safe fallback state, preventing crashes.

---

## 💎 Production-Grade Refinements

- **Hydration Flicker Mitigation:** React SSR (Server-Side Rendering) often suffers from layout shifts when hydrating `localStorage` data. We introduced an explicit `isHydrated` lifecycle barrier that renders a premium skeleton loader until the client state completely synchronizes with browser storage.
- **Strict Input Guardrails:** Folder and file creations pass through robust regex validators (`/[\\/:*?"<>|]/`) and aggressive `trim()` filters. Edge cases like empty spaces or illegal Windows/Unix characters immediately trigger subtle inline validation errors.
- **Desktop Keyboard Navigation:** We respect the user's muscle memory. Native desktop shortcuts have been wired into the UI:
  - `Enter`: Navigate into folders or open files.
  - `F2`: Instantly triggers the inline rename dialog.
  - `Delete` / `Backspace`: Summons a destructive action confirmation modal.
  - `Ctrl + S` / `Cmd + S`: Saves the active file without triggering the browser's save-page dialog.

---

## 📱 Responsive Layout Design

The workspace dynamically morphs to respect the user's viewport without compromising capabilities.
- **Adaptive Mobile Overlay Drawer:** On devices below `768px`, the sidebar tree view gracefully transforms into an `absolute` off-canvas drawer that slides in effortlessly via a dedicated mobile toolbar toggle.
- **Fluid Grid Refactor:** The grid layout actively scales from `grid-cols-1` on mobile phones, morphing into `grid-cols-2`, `grid-cols-3`, and `grid-cols-4` as horizontal real estate expands.
- **Editor Dominance:** When a file is opened on mobile, the text editor slides in to take 100% of the viewport width, granting maximum space for virtual keyboards, complete with a clean "Back" chevron to return to the grid.

---

*Built with passion, strict TypeScript, TailwindCSS, and Shadcn UI.*
