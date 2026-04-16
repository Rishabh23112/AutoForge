# AutoForge 🔨 

**Empowering Developers with an Autonomous AI Software Engineer that Plans, Builds, Runs, and Self-Heals.**

AutoForge is more than a code generator; it is a fully autonomous development pipeline that bridges the gap between natural language prompts and stable, production-ready applications. By integrating a secure Docker sandbox and an iterative "Fix-and-Test" loop, AutoForge ensures that the code it writes is not just syntactically correct, but fully functional.


## 🔄 The Autonomous Lifecycle

AutoForge operates on a continuous feedback loop, ensuring high reliability:

1.  **🧠 Analysis & Planning**: The Architect Agent decomposes your request into a structured project blueprint.
2.  **🏗️ Implementation**: The Builder Agent generates complete, modular source code based on the blueprint.
3.  **🐳 Sandboxed Execution**: Code is instantly deployed into an isolated Docker container.
4.  **🩺 Self-Healing Loop**: If runtime errors or build failures occur, the Fixer Agent analyzes the stack trace and applies iterative patches until the system is stable.
5.  **⚖️ Quality Assurance**: An LLM-as-a-Judge evaluation system scores the final output based on readability, security, and completeness.

---

## ✨ Features

- **🛡️ Secure Isolation**: All generated code runs in a ephemeral Docker sandbox, protecting your host system.
- **⚡ High-Speed Iteration**: Powered by **Gemini 2.5-flash** and **Groq** for near-instant responses.
- **🛠️ Zero-Placeholder Policy**: Generated projects are complete with logic, styling, and configuration—no "TODO" comments.
- **🎨 Premium AI Workspace**: A sleek, dark-mode IDE built with Vite and GSAP for fluid micro-animations.
- **🔄 Smart Modifications**: Update existing projects by simply describing the changes; AutoForge surgical applies updates while maintaining context.
- **📊 Detailed Evaluation**: Real-time feedback on code quality with detailed scoring and suggestions.

---

## 🏗️ Technical Architecture

AutoForge utilizes a multi-agent orchestration pattern:
- **Planner Agent**: Orchestrates project requirements and dependencies.
- **Builder Agent**: Implements the source code using Pydantic-enforced schemas for structured output.
- **Executor Agent**: Manages the Docker lifecycle (Build -> Run -> Logs).
- **Fixer Agent**: Specializes in recursive debugging and surgical file updates.
- **Evaluator Agent**: Performs static and semantic analysis to provide quality scores.

---

## 🚀 Quick Start

### Prerequisites
- **Docker Desktop**: Essential for the execution sandbox and containerization.
- **Python 3.10+** (if running locally without Docker).
- **Node.js 18+** (for frontend development).

### 1. Installation
```bash
git clone https://github.com/Rishabh23112/AutoForge.git
cd AutoForge
```

### 2. Configuration
Create a `.env` file in the root directory:

Fill in your API keys:
- `GOOGLE_API_KEY`: Your Gemini API key.
- `GROQ_API_KEY`: Your Groq API key (used for high-speed analysis).

### 3. Launch with Docker (Recommended)
AutoForge is fully containerized. Start the entire ecosystem with one command:
```bash
docker-compose up --build
```

- **Main UI**: `http://localhost:3000`
- **Backend API**: `http://localhost:8000`
- **Sandbox Preview**: Once the app is built, access it at `http://localhost:3001` (Frontend) or `http://localhost:8001` (Backend).

### 4. Manual Local Setup (Without Docker)
If you prefer to run the components manually:

#### Backend (FastAPI)
> [!IMPORTANT]
> Even when running locally, **Docker Desktop** must be running on your machine. AutoForge requires the Docker CLI to create and manage sandboxed execution environments.

1. Navigate to the backend directory: `cd backend`
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies: `pip install -r requirements.txt`
4. Start the server:
   ```bash
   uvicorn api:app --reload --port 8000
   ```

#### Frontend (React + Vite)
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`

> [!NOTE]
> The frontend expects the backend to be running at `http://localhost:8000`. If you change the backend port, update the `VITE_API_BASE_URL` in your `.env` or in the frontend configuration.



---

## 📂 Project Structure

```text
/
├── backend/            # FastAPI Orchestrator & Multi-Agent System
│   ├── agents/         # Intelligence Layer (Planner, Builder, Fixer)
│   ├── evaluation/     # LLM-as-a-Judge validation logic
│   ├── services/       # Core execution & sandbox orchestration
│   └── api.py          # FastAPI endpoints & streaming logic
├── frontend/           # React + Vite + GSAP AI Workspace
│   ├── src/components/ # Modular UI (Atomic Design)
│   ├── src/hooks/      # State management & Event Streaming
│   └── src/pages/      # Main application views
├── .env.example        # Environment template
├── docker-compose.yml  # Root container orchestration
└── README.md           # Documentation
```

---

## 🛠️ Tech Stack

- **Large Language Models**: Google Gemini 2.5-flash, Groq.
- **Backend**: FastAPI, LangChain, Pydantic, Python 3.10.
- **Frontend**: React 18, Vite, GSAP (Animations), TailwindCSS (for generated apps), Lucide Icons.
- **Sandboxing**: Docker-in-Docker, Ephemeral Containers.

---


