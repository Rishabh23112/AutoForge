# AutoForge 🔨 
**An Autonomous AI Software Engineer that builds, runs, and debugs its own code.**

![Status: Active Development](https://img.shields.io/badge/Status-Active%20Development-blue)
![Python](https://img.shields.io/badge/Python-3.10%2B-blue)
![Agentic AI](https://img.shields.io/badge/Architecture-Agentic%20AI-orange)

I am trying to build an AI agent that doesn't just write code, but owns the entire SOFTWARE DEVELOPMENT LIFE CYCLE (SDLC). I am building this completely from scratch. 

AutoForge is not just another LLM API wrapper that dumps raw text into a terminal. I am continuing with the idea of a multi-agent system designed to take a natural language idea, generate a structured project blueprint, route properly indented code to the correct file paths, and—ultimately—execute and debug itself in a sandboxed environment.

## 🎯 The Vision
Most AI code generators stop at generation. I am building AutoForge to close the loop: **Generate → Execute → Catch Errors → Self-Heal-> Docker img File.** The goal is a mini autonomous developer that handles boilerplate, project scaffolding, and iterative debugging, allowing human engineers to focus on high-level architecture.

---

## 🏗️ Architecture & Current State

I am building the system in distinct phases. The foundational generation pipeline is complete, and active development is focused on the execution and self-healing loop.

### ✅ Phase 1 & 2: The Generation Engine (Completed)
The core generation pipeline successfully translates natural language into a local codebase, built entirely from scratch.
* **The Planner Agent:** Ingests a user prompt and outputs a structured JSON blueprint (tech stack, folder structure, deployment steps).
* **The Builder Agent:** Consumes the blueprint and leverages **Pydantic structured outputs** to generate precise file paths and code snippets.
* **The I/O Router:** Safely parses the Pydantic objects, creates sanitized directories, and writes files while strictly preserving Python indentation and formatting.

### 🚧 Phase 3: Sandboxed Execution (In Progress)
Code generation is useless without validation. The current focus is building a safe execution environment.
* **Docker Integration:** Utilizing the Python Docker SDK to dynamically build images and spin up containers for generated projects.
* **Health Checks:** Automated pinging of local endpoints to verify successful server startup.
* **Test Execution:** Programmatically running test suites (e.g., `pytest`) inside the container and capturing `stdout`/`stderr`.

### 🔮 Phase 4: The Auto-Fix Loop (Planned)
The brain of the operation. When Phase 3 catches an error, Phase 4 fixes it.
* **Context-Aware Debugging:** Feeding specific stack traces and broken files back to the LLM without blowing up the context window.
* **Patch Application:** LLM outputs JSON patches to fix specific lines of code.
* **Iterative Healing:** The system rebuilds the container and tests again, up to a defined retry limit.

### 🔮 Phase 5: Streaming & UI (Planned)
* **Real-time Feedback:** Integrating FastAPI Server-Sent Events (SSE) or WebSockets to stream the LLM's thought process, file generation status, and test results back to the user in real-time.

---

## 🚀 Getting Started

*(Note: AutoForge is currently in active development. Setup instructions for the local generation engine will be added shortly.)*

### Prerequisites
* Python 3.10+
* An active LLM API Key (OpenAI / Anthropic / OpenRouter)
* Docker Desktop (Required for upcoming execution features)

---

## 🧠 Why Build This From Scratch?
Building a self-healing loop from the ground up requires navigating infinite hallucination loops, managing context window limits, and handling the complexities of executing untrusted AI-generated code. AutoForge is a demonstration of raw system design, prompt engineering, and the realities of applied Agentic AI without the crutch of pre-built abstraction layers.
