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

1. Build `backend/Dockerfile` with `backend/` as the build context, push a uniquely tagged image to the existing AWS ECR repository, and create a new ECS task definition revision with that image URI. Update the existing ECS service to use the revision.
2. Keep backend environment variables and secrets in the ECS runtime configuration. Set `CLIENT_URL` to the frontend's CloudFront/custom-domain origin. Configure `/api/health` for health checks; ECS container health checks must be set in the task definition.
3. In `frontend/`, set `VITE_API_URL` to the HTTPS backend URL ending in `/api`, run `npm ci`, and run `npm run build`.
4. Upload the contents of `frontend/dist/` to a private S3 bucket served through CloudFront using Origin Access Control. Set `index.html` as the default root object and configure React route fallback. After updates, invalidate the CloudFront cache.

The local [AWS deployment guide](DEPLOYMENT.md) contains PowerShell commands, console settings, and rollback steps. This guide is currently excluded by `.gitignore`. No CI/CD pipeline or automated test suite is required.
