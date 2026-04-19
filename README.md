# ✨ TaskMaster — AI-Powered Serverless Task Manager

A full-stack, production-grade task management application built with **React 19**, **Vite**, and **AWS Amplify**. TaskMaster empowers users to organize, prioritize, and complete tasks with real-time sync, file attachments, AI-powered advice, and a premium dark/light mode UI — all backed by a fully serverless AWS infrastructure.

## 🚀 Features

### Core Task Management
- **Create, Read, Update, Delete** — Full CRUD operations on personal tasks
- **Priority Levels** — Assign High 🔴, Medium 🟡, or Low 🟢 priority to each task
- **Due Dates** — Set deadlines with automatic sorting (upcoming tasks appear first)
- **Task Completion** — Toggle tasks between active and completed states with visual feedback
- **Search & Filter** — Real-time search across task names and descriptions

### AI-Powered Assistance
- **AI Task Advice** — Get intelligent, step-by-step suggestions for completing any task via a REST API backed by **AWS Lambda**
- **Image-Aware AI** — When a task has a file attachment, the AI analyzes the image alongside the task for contextual advice

### File Management
- **File Attachments** — Upload images, PDFs, or text files to tasks via **Amazon S3**
- **Inline Previews** — View image thumbnails directly on task cards
- **Full-Size Viewer** — Click any attachment to open the full-resolution file in a new tab

### Real-Time & Security
- **Real-Time Sync** — Live updates via **GraphQL Subscriptions** (AppSync WebSockets) — changes appear instantly without refresh
- **Optimistic Updates** — UI updates immediately on user actions, reverts on failure
- **Secure Authentication** — Email/password sign-up and sign-in via **Amazon Cognito**
- **Owner-Level Authorization** — Strict `@auth` rules ensure each user can only access their own tasks

### Premium UI
- **Dark / Light Mode** — Full theme toggle with smooth transitions across all components
- **Glassmorphism Navbar** — Sticky navigation with backdrop blur and animated gradient border
- **Animated Cards** — Staggered fade-in animations, hover lift effects, priority-colored borders
- **Responsive Design** — Mobile-first layout with breakpoints at 768px and 480px
- **Custom Typography** — Google Fonts (Inter) with refined letter-spacing and weight hierarchy

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                             │
│   React 19 + Vite + Amplify UI React + Custom CSS Theme     │
└─────────────┬──────────────┬──────────────┬─────────────────┘
              │              │              │
    ┌─────────▼──────┐ ┌────▼─────┐ ┌──────▼────────┐
    │  AWS AppSync    │ │ Amazon   │ │ API Gateway   │
    │  (GraphQL API)  │ │ Cognito  │ │ (REST API)    │
    │                 │ │ (Auth)   │ │               │
    │  Queries        │ │          │ │  /suggest     │
    │  Mutations      │ │ User     │ │               │
    │  Subscriptions  │ │ Pools    │ └──────┬────────┘
    └─────────┬───────┘ └──────────┘        │
              │                       ┌─────▼────────┐
    ┌─────────▼───────┐               │ AWS Lambda   │
    │ Amazon DynamoDB  │               │ (aiTask      │
    │ (Todo Table)     │               │  Function)   │
    └─────────────────┘               └──────────────┘
                                            │
    ┌─────────────────┐               ┌─────▼────────┐
    │ Amazon S3        │               │ AWS Lambda   │
    │ (File Storage)   │               │ (emailRemind │
    │ todoStorage      │               │  erFunction) │
    └─────────────────┘               └──────────────┘
```

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite 8, JSX |
| **UI Library** | AWS Amplify UI React, Custom CSS |
| **Typography** | Google Fonts (Inter) |
| **Authentication** | Amazon Cognito (Email / Password) |
| **GraphQL API** | AWS AppSync |
| **REST API** | Amazon API Gateway |
| **Database** | Amazon DynamoDB |
| **File Storage** | Amazon S3 |
| **Serverless Functions** | AWS Lambda (AI Advice, Email Reminders) |
| **Hosting** | AWS Amplify Hosting |

## 📁 Project Structure

```
todo-app/
├── amplify/                    # AWS Amplify backend configuration
│   └── backend/
│       ├── api/
│       │   ├── todoapp/        # GraphQL API (AppSync + DynamoDB)
│       │   └── aiprediction/   # REST API (API Gateway)
│       ├── auth/               # Amazon Cognito configuration
│       ├── function/
│       │   ├── aiTaskFunction/       # Lambda: AI task advice
│       │   └── emailReminderFunction/ # Lambda: email reminders
│       ├── storage/
│       │   └── todoStorage/    # S3 bucket configuration
│       └── hosting/            # Amplify Hosting configuration
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          # Sticky glassmorphism navigation bar
│   │   ├── CreateTodo.jsx      # Task creation form with file upload
│   │   └── TodoItem.jsx        # Individual task card with AI advice
│   ├── graphql/
│   │   ├── mutations.js        # Create, Update, Delete operations
│   │   ├── queries.js          # GetTodo, ListTodos queries
│   │   ├── subscriptions.js    # Real-time onCreate, onUpdate, onDelete
│   │   └── schema.json         # Auto-generated full GraphQL schema
│   ├── App.jsx                 # Main app: theme, routing, state management
│   ├── App.css                 # Premium UI: animations, dark mode, responsive
│   ├── index.css               # Global styles: fonts, scrollbar, resets
│   ├── main.jsx                # Entry point: Amplify.configure() + React root
│   └── amplifyconfiguration.json # Auto-generated Amplify config
├── index.html                  # HTML shell with Google Fonts & SEO meta
├── vite.config.js              # Vite configuration with Amplify alias
└── package.json                # Dependencies and scripts
```

## 📋 GraphQL Schema

```graphql
type Todo @model @auth(rules: [{ allow: owner }]) {
  id: ID!
  name: String!
  description: String
  isCompleted: Boolean
  filePath: String
  priority: String        # "High" | "Medium" | "Low"
  dueDate: AWSDate
}
```

The `@model` directive auto-provisions a DynamoDB table and CRUD resolvers. The `@auth(rules: [{ allow: owner }])` directive ensures each user can only access their own tasks.

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [AWS CLI](https://aws.amazon.com/cli/) configured with an active AWS account
- AWS Amplify CLI: `npm install -g @aws-amplify/cli`

## ⚙️ Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/todo-app.git
   cd todo-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Initialize Amplify environment** (if pulling from git):
   ```bash
   amplify pull --appId <your-app-id> --envName <your-env-name>
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server at `localhost:5173` |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint code quality checks |

## ☁️ Deployment

**Deploy frontend changes:**
```bash
amplify publish
```

**Push backend changes** (GraphQL schema, Lambda, storage):
```bash
amplify push
```

## 🔐 Security Overview

- **Authentication**: Amazon Cognito User Pools with email/password flow
- **Authorization**: Owner-based access control — each user's tasks are completely isolated
- **API Security**: All GraphQL and REST endpoints require a valid Cognito JWT token
- **File Storage**: S3 bucket with public read access for guest-level file uploads (attached to tasks)

## 🎨 UI Design System

| Token | Light Mode | Dark Mode |
|-------|-----------|-----------|
| Primary | `#6366f1` (Indigo) | `#818cf8` |
| Background | `#ffffff` / `#f1f5f9` | `#0f172a` / `#1e293b` |
| Card | White with subtle shadow | Slate 800 with dark shadow |
| Priority High | 🔴 Red left border | 🔴 Red left border |
| Priority Medium | 🟡 Amber left border | 🟡 Amber left border |
| Priority Low | 🟢 Green left border | 🟢 Green left border |
| Font | Inter (300–800 weights) | Inter (300–800 weights) |
