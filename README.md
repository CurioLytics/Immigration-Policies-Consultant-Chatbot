# Immigration Policies Consultant Chatbot

This project is a chatbot designed to provide consultation on immigration policies. It features a Flask backend with JWT authentication and a React frontend.

## Project Structure

The project is organized into two main directories:

- `backend/`: Contains the Flask application, including API endpoints, database models, and AI integration.
- `frontend/`: Contains the React application, including UI components, pages, and services for interacting with the backend.

## Prerequisites

- Python 3.9 or higher
- PostgreSQL 17(required for local development)
- Node.js and npm (for the frontend)
- Docker (optional, for containerized deployment of the backend)
- `pip` (Python package installer)

## Backend Details

The backend is built using Flask and utilizes several extensions.

### Key Backend Dependencies:

- `Flask`: The core web framework.
- `Flask-CORS`: For handling Cross-Origin Resource Sharing.
- `Flask-SQLAlchemy`: For database interactions (PostgreSQL recommended).
- `Flask-JWT-Extended`: For JWT authentication management.
- `google-generativeai`: For interacting with Google's generative AI models (Gemini).
- `python-dotenv`: For managing environment variables.

A full list of backend dependencies can be found in `backend/requirements.txt`.

### Key Backend Features:

- **User Authentication**: Secure registration and login for users using JWT.
    - Endpoints: `/auth/register`, `/auth/login`, `/auth/logout`, `/auth/refresh`, `/auth/whoami`.
- **Guest User Access**: Users can interact with the chatbot as guests. Guest sessions are managed using a distinct JWT type, allowing for a seamless experience without immediate registration.
- **Chat Interface**: Core endpoint (`/chat/message`) for sending messages to the AI and receiving responses. This endpoint supports both authenticated users (saving chat history) and guest users (ephemeral chat).
- **Chat History (Registered Users)**:
    - `/chat_history/sessions`: Lists all chat sessions for the logged-in user.
    - `/chat_history/sessions/<session_id>/messages`: Retrieves messages for a specific session.
- **AI Integration**: Utilizes Google's Generative AI (Gemini) for chatbot responses.
- **Rate Limiting**: Implemented on authentication endpoints to prevent abuse.

### Backend Environment Variables

Ensure you have a `.env` file in the `backend` directory or set the following environment variables:

- `FLASK_APP=main.py`
- `FLASK_ENV` (e.g., `development`, `production`)
- `FLASK_POSTGRES_URL` (your PostgreSQL database connection string, e.g., `postgresql://user:password@host:port/dbname`)
- `JWT_SECRET_KEY` (a strong, unique secret key)
- `GEMINI_API_KEY` (your Google Gemini API key)
- `GEMINI_MODEL_NAME` (optional, defaults to `gemini-2.0-flash-exp`)

## Frontend Details

The frontend is a single-page application built with React.

### Key Frontend Libraries:

- `react`: Core library for building user interfaces.
- `react-router-dom`: For handling client-side routing.
- `axios`: For making HTTP requests to the backend API.

Key frontend source files are located in `frontend/src/`.

### Frontend Structure:

- `frontend/src/components/`: Reusable UI components (e.g., authentication forms, layout elements).
- `frontend/src/pages/`: Top-level page components (e.g., `LandingPage.js`, `LoginPage.js`, `ChatbotInterface.js`).
- `frontend/src/services/`: Modules for interacting with the backend API:
    - `apiClient.js`: Configured Axios instance with base URL and interceptors for attaching JWT tokens and handling responses.
    - `authService.js`: Functions for login, registration, and logout.
    - `chatService.js`: Functions for sending messages and managing chat sessions.
- `frontend/src/App.js`: Main application component that sets up routing.

### Running the Frontend

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run the development server:**
    ```bash
    npm start
    ```
    The frontend will typically be available at `http://localhost:3000/`.

## Usage

### Running Locally (Backend & Frontend)

1.  **Start the Backend:**
    - Navigate to the `backend` directory.
    - Create a virtual environment and install dependencies (`pip install -r requirements.txt`).
    - Set up your `.env` file with the necessary backend environment variables.
    - Run the Flask development server:
        ```bash
        python main.py # or `set python main.py` on Windows cmd
        ```
    The backend will typically be available at `http://127.0.0.1:5000/`.

2.  **Start the Frontend:**
    - Navigate to the `frontend` directory.
    - Install dependencies (`npm install`).
    - Run the React development server (`npm start`).
    The frontend will typically be available at `http://localhost:3000/` and will connect to the backend at `http://localhost:5000`.

### Running Backend with Docker

1.  **Build the Docker image:**
    Navigate to the `backend` directory where the `Dockerfile` is located.
    ```bash
    cd backend
    docker build -t immigration-chatbot-backend .
    ```

2.  **Run the Docker container:**
    ```bash
    docker run -p 5000:5000 \
      -e FLASK_POSTGRES_URL='your_database_uri' \
      -e JWT_SECRET_KEY='your_jwt_secret' \
      -e GEMINI_API_KEY='your_gemini_api_key' \
      immigration-chatbot-backend
    ```
    Replace the placeholder values with your actual configuration. You can also use the `--env-file` option with `docker run` to load variables from a file.
    The backend application will be available at `http://localhost:5000/`. Remember to start the frontend separately.

---