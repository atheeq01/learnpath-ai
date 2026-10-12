# LearnPath AI

Online Learning Platform with AI Course Recommendations.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, React Router, Axios
- Backend: Node.js, Express.js
- Database: MongoDB Atlas
- Authentication: JWT, bcrypt
- AI: OpenAI API

## Project Structure

- backend/ - REST API and business logic
- frontend/ - React web application

## Development Status

The student and instructor interfaces include course discovery, enrollment history, course management, student rosters, and AI recommendations.

See the [frontend guide](frontend/README.md) for setup, the simplified file structure, API integration, build commands, and interview questions.

## Features

- Student and instructor registration
- User login and authentication
- Course management
- Student enrollment
- Instructor student roster
- AI course recommendations

## Manual deployment

1. In `backend/`, run `npm ci --omit=dev`, configure the environment variables listed in `.env.example`, and start the API with `npm start`.
2. In `frontend/`, run `npm ci`, set `VITE_API_URL` to the deployed backend URL ending in `/api`, and run `npm run build`.
3. Upload `frontend/dist/` to your static host. Configure it to serve `index.html` for client-side routes and set the backend's `CLIENT_URL` to the frontend origin.

The backend Dockerfile is also available for manually building and running the API as a container.
