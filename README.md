# Job Portal App

A full-stack job portal application built with Node.js, Express, EJS, and MongoDB. It allows recruiters to post and manage job listings, while job seekers can register, log in, browse jobs, view details, and apply with a resume upload.

## Features

- Recruiter and job seeker authentication
- Secure session-based login flows
- Job posting, updating, and management
- Job listing and filter/search functionality
- Job details page with application form
- Resume upload for job applications
- Email notifications support
- MongoDB-backed data persistence
- Responsive front-end using EJS and CSS

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- EJS templating
- HTML/CSS/JavaScript
- Multer for file uploads
- bcryptjs for password hashing
- express-session for session management
- nodemailer for email functionality

## Project Structure

```bash
.
├── app.js
├── package.json
├── .env.example
├── config/
│   └── db.js
├── controllers/
├── middleware/
├── models/
├── public/
├── routes/
├── views/
├── .gitignore
├── package-lock.json
└── README.md
```

## Prerequisites

Before running this project, make sure you have the following installed:

- Node.js (v18 or later recommended)
- MongoDB running locally or a MongoDB Atlas connection string
- npm

## Installation

1. Clone the repository:

```bash
git clone https://github.com/nav7v/Job-Portal-App.git
cd Job-Portal-App
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the project root by copying `.env.example`:

```bash
cp .env.example .env
```

4. Update the environment variables in `.env`:

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/job-portal
SESSION_SECRET=your-secret-key-here
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## Running the App

Start the server:

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Environment Variables

| Variable | Description |
| --- | --- |
| `PORT` | Port where the app runs |
| `MONGODB_URI` | MongoDB connection string |
| `SESSION_SECRET` | Secret key for session encryption |
| `EMAIL_USER` | Email used for notifications |
| `EMAIL_PASS` | App password or email password for SMTP |

## Notes

- If MongoDB is not running, the app will fail to connect to the database.
- For Gmail or similar providers, use an app-specific password if required.
- The app uses EJS templates rendered server-side from the `views` directory.

## License

This project is licensed under the ISC license.

## Author

Built as a full-stack job portal application for managing job listings and applications.
