# BugTrackerLite

A full-stack bug tracking and project management application built with Django REST Framework and React.
Live : https://bug-tracker-frontend-delta.vercel.app/
## Overview

BugTrackerLite is a lightweight but powerful bug tracking system designed to help development teams manage bugs, track projects, and assign work efficiently. The application features role-based access control with Administrator and Developer roles, allowing for organized workflow management.

## Key Features

- **Project Management**: Create and manage multiple projects with status tracking (Planning, Active, Completed)
- **Bug Tracking**: Log, track, and manage bugs with detailed information including severity, priority, and status
- **Developer Assignment**: Assign bugs to developers and track their progress
- **Activity Logging**: Maintain records of all activities within the system
- **File Attachments**: Attach files to bug reports for context and evidence
- **Role-Based Access Control**: Separate Administrator and Developer roles with appropriate permissions
- **JWT Authentication**: Secure API endpoints with token-based authentication
- **Real-time Dashboard**: Dashboard with project and bug statistics

## Technology Stack

### Backend
- **Framework**: Django 6.0.6
- **API**: Django REST Framework 3.17.1
- **Authentication**: SimpleJWT (JWT-based token authentication)
- **Database**: MySQL
- **Server**: Gunicorn 26.0.0
- **CORS**: django-cors-headers for cross-origin requests

### Frontend
- **Framework**: React 18.3.1
- **Language**: TypeScript 5.6.3
- **Build Tool**: Vite 5.4.11
- **HTTP Client**: Axios 1.7.9
- **Routing**: React Router DOM 6.28.0
- **Icons**: Lucide React 0.468.0

## Project Structure

```
BugTrackerLite/
├── BugTrackerLite_backend/
│   ├── config/                 # Django project settings
│   │   ├── settings.py        # Main configuration
│   │   ├── urls.py            # URL routing
│   │   ├── wsgi.py            # WSGI application
│   │   └── asgi.py            # ASGI application
│   ├── tracker/               # Main Django app
│   │   ├── models.py          # Database models
│   │   ├── views.py           # API viewsets and views
│   │   ├── serializers.py     # DRF serializers
│   │   ├── admin.py           # Admin configuration
│   │   └── migrations/        # Database migrations
│   ├── manage.py              # Django management script
│   ├── requirements.txt        # Python dependencies
│   └── Procfile               # Deployment configuration
│
└── frontend/
    ├── src/
    │   ├── components/        # Reusable React components
    │   │   ├── Layout.tsx
    │   │   ├── BugForm.tsx
    │   │   ├── ProjectForm.tsx
    │   │   ├── DeveloperForm.tsx
    │   │   ├── BugTable.tsx
    │   │   ├── StatusUpdateForm.tsx
    │   │   ├── Badges.tsx
    │   │   ├── Modal.tsx
    │   │   └── ProtectedRoute.tsx
    │   ├── pages/            # Page components
    │   │   ├── LoginPage.tsx
    │   │   ├── DashboardPage.tsx
    │   │   ├── ProjectsPage.tsx
    │   │   ├── ProjectDetailPage.tsx
    │   │   ├── BugsPage.tsx
    │   │   ├── DevelopersPage.tsx
    │   │   └── NotFoundPage.tsx
    │   ├── api/              # API client
    │   │   └── axiosClient.ts
    │   ├── services/         # Business logic services
    │   ├── context/          # React context for state management
    │   ├── types/            # TypeScript type definitions
    │   ├── App.tsx           # Main App component
    │   └── main.tsx          # React entry point
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    └── index.html
```

## Installation

### Backend Setup

1. **Clone and navigate to backend directory**
   ```bash
   cd BugTrackerLite_backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   Create a `.env` file in the backend root:
   ```
   SECRET_KEY=your-secret-key-here
   DEBUG=True
   DB_NAME=bugtrackerlite_db
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_HOST=localhost
   DB_PORT=3306
   ```

5. **Run migrations**
   ```bash
   python manage.py migrate
   ```

6. **Create superuser (optional)**
   ```bash
   python manage.py createsuperuser
   ```

7. **Start development server**
   ```bash
   python manage.py runserver
   ```
   Backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   Frontend will be available at `http://localhost:5173`

4. **Build for production**
   ```bash
   npm run build
   ```

## Authentication

The application uses JWT (JSON Web Tokens) for authentication.

### Login Flow
1. User submits credentials to `/api/login/`
2. Server returns `access` and `refresh` tokens
3. Client stores tokens (typically in localStorage)
4. Subsequent requests include the access token in the `Authorization` header: `Bearer {token}`
5. Expired tokens can be refreshed using `/api/login/refresh/` with the refresh token

## API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed endpoint documentation.

### Base URL
- Development: `http://localhost:8000`
- Production: Configure based on deployment

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/login/` | Obtain JWT tokens |
| POST | `/api/login/refresh/` | Refresh access token |
| GET | `/api/me/` | Get current user profile |

### Resource Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET, POST | `/api/developers/` | List and create developers |
| GET, PATCH, DELETE | `/api/developers/{id}/` | Retrieve, update, delete developer |
| GET, POST | `/api/projects/` | List and create projects |
| GET, PATCH, DELETE | `/api/projects/{id}/` | Retrieve, update, delete project |
| GET, POST | `/api/bugs/` | List and create bugs |
| GET, PATCH, DELETE | `/api/bugs/{id}/` | Retrieve, update, delete bug |
| PATCH | `/api/bugs/{id}/status/` | Update bug status |

## Database Schema

See [ER_DIAGRAM.md](./ER_DIAGRAM.md) for detailed entity relationships.

### Core Models

**User**
- Extends Django's AbstractUser
- Roles: ADMINISTRATOR, DEVELOPER
- Fields: username, email, password, role, designation, is_active

**Project**
- Fields: name, description, repository_url, priority, status, created_at
- Status options: Planning, Active, Completed
- Priority options: Low, Medium, High

**Bug**
- Fields: title, description, project (FK), developer (FK), severity, priority, status, due_date, resolution_comment, created_at, updated_at
- Status options: Open, In Progress, Resolved, Closed
- Severity options: Low, Medium, High, Critical
- Priority options: Low, Medium, High

**BugAttachment**
- Fields: bug (FK), uploader (FK), file_url, file_name, uploaded_at

**ActivityLog**
- Fields: user (FK), action_type, description, created_at

## Deployment

### Railway Deployment

The application is configured for Railway deployment using environment variables and Procfile.

### Environment Configuration

Ensure these environment variables are set:
- `SECRET_KEY`: Django secret key
- `DEBUG`: Set to False in production
- `DB_NAME`: Database name
- `DB_USER`: Database user
- `DB_PASSWORD`: Database password
- `DB_HOST`: Database host
- `DB_PORT`: Database port

### Frontend Deployment

The frontend can be deployed to services like Vercel, Netlify, or GitHub Pages after building:
```bash
npm run build
```

## Development Guidelines

### Backend Development

1. **Model Changes**: Create migrations after model updates
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

2. **API Serializers**: Update serializers when changing model fields

3. **Validation**: Use serializer validation for business logic validation

### Frontend Development

1. **Component Structure**: Keep components focused and reusable
2. **Type Safety**: Always define TypeScript types for props and API responses
3. **State Management**: Use React Context for shared state
4. **API Calls**: Use the centralized axios client in `src/api/axiosClient.ts`

## Common Issues and Solutions

### CORS Errors
- Ensure `CORS_ALLOWED_ORIGINS` in Django settings includes your frontend URL
- Default: `http://localhost:5173`

### Database Connection Issues
- Verify MySQL is running
- Check `.env` file has correct database credentials
- Ensure database exists

### Authentication Issues
- Token might be expired - refresh using refresh endpoint
- Verify token is being sent in Authorization header
- Clear localStorage and login again if needed

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

This project is provided as-is for educational and development purposes.

## Support

For issues, questions, or suggestions, please open an issue in the project repository.
