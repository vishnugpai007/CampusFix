# CampusFix

CampusFix is a production-grade campus issue reporting and tracking web application built for university infrastructure management.

## Tech Stack
- **Frontend**: React 18, Vite, React Router, Tailwind CSS, Axios, React Hook Form
- **Backend**: Node.js, Express (ES Modules), Mongoose, Zod
- **Database**: MongoDB Atlas / MongoDB Local
- **Auth**: JWT (15-minute access token, 7-day httpOnly refresh cookie)
- **Security**: Bcrypt, Helmet, Express Rate Limit, CORS allowlist

## Project Structure
- `client/`: Vite React application
- `server/`: Express API server following strict layering (`routes` -> `middleware` -> `controller` -> `service` -> `model`)
