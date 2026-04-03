# Access Review System

<div align="center">

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-14%2B-brightgreen.svg)](https://nodejs.org/)
[![PNPM](https://img.shields.io/badge/pnpm-8.15%2B-yellow.svg)](https://pnpm.io/)
![Status](https://img.shields.io/badge/status-educational-informational.svg)

**Academic Capstone Project** | Open Source | Full-Stack Web Application

A full-stack web application for managing and reviewing the accessibility of public spaces, built as an educational project to demonstrate modern web development practices.

[Overview](#-overview) • [Features](#-features) • [Quick Start](#-quick-start) • [Contributing](#-contributing)

</div>

---

## 📚 About This Project

**Access Review System** is an open-source academic project developed as a capstone/final year project to demonstrate comprehensive full-stack web development skills. The project showcases:

- **Modern Architecture**: Monorepo structure with frontend and backend separation
- **Best Practices**: Code quality, testing, documentation, and version control
- **Real-World Concepts**: Authentication, authorization, database design, API development
- **Scalable Design**: RESTful APIs, TypeScript, automated testing, CI/CD ready

**Educational Goal**: This project demonstrates how to build, test, and deploy a production-ready web application following industry best practices.

---

## 🎓 Learning Outcomes

Students working on this project learn:

- **Backend Development**: Node.js, Express, MongoDB, RESTful API design
- **Frontend Development**: React, TypeScript, Vite, component architecture
- **Database Design**: Mongoose schemas, indexing, data relationships
- **Testing**: Unit tests, integration tests, performance testing
- **Authentication & Security**: JWT, password hashing, secure APIs
- **DevOps & Git**: Monorepo setup, pre-commit hooks, branching strategies
- **Documentation**: README, API docs, contributing guidelines
- **Collaboration**: Code review, pull requests, team development

---

## ✨ Key Features

### Core Functionality

- 👤 **User Authentication & Authorization**: JWT-based authentication with role-based access control (RBAC)
- 📝 **Review Management**: Create, read, update, delete (CRUD) operations for accessibility reviews
- 🏢 **Space Management**: Manage public spaces with coordinates and categorization
- ✅ **Feature Catalog**: Extensible accessibility features system
- 📊 **Data Aggregation**: Compute accessibility summaries and statistics
- ⛅ **Third-party Integration**: Weather API integration (Open-Meteo)

### Technical Highlights

- ✅ **Comprehensive Testing**: Unit, integration, and performance tests
- 📚 **API Documentation**: Swagger/OpenAPI with auto-generated docs
- 🎨 **Code Quality**: Prettier formatting with pre-commit hooks (Husky)
- 🏗️ **Monorepo Architecture**: Unified workspace with frontend and backend
- 🚀 **Modern Stack**: React + TypeScript (frontend), Node.js + Express (backend)
- 📦 **Package Management**: PNPM workspace for efficient dependency management

---

## 🛠️ Tech Stack

| Layer               | Technology                                        |
| ------------------- | ------------------------------------------------- |
| **Frontend**        | React 18+, TypeScript, Vite, TailwindCSS          |
| **Backend**         | Node.js 14+, Express.js, MongoDB                  |
| **Database**        | MongoDB + Mongoose ODM                            |
| **Authentication**  | JWT (x-auth-token header)                         |
| **Testing**         | Jest, Supertest, Artillery, mongodb-memory-server |
| **API Docs**        | Swagger/OpenAPI                                   |
| **Package Manager** | pnpm                                              |
| **Git Hooks**       | Husky + Prettier                                  |

---

## 📋 Prerequisites

Before getting started, ensure you have:

- **Node.js** 14.x or higher ([Download](https://nodejs.org/))
- **pnpm** 8.15 or higher (`npm install -g pnpm`)
- **MongoDB** instance (local or cloud like [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **Git** ([Download](https://git-scm.com/))

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/ModithaM/access-review-system.git
cd access-review-system
```

### 2. Install Dependencies

```bash
pnpm install
```

This installs dependencies for the entire monorepo (root, backend, and frontend).

### 3. Configure Environment Variables

**Backend Setup:**

Copy the sample environment file:

```bash
cp backend/sample.variables.env backend/.variables.env
```

Edit `backend/.variables.env` and set your configuration:

```env
# MongoDB connection string
DATABASE=mongodb://localhost:27017/access-review-system

# JWT secret for token signing
JWT_SECRET=your-super-secret-jwt-key

# Express session secret
SECRET=your-session-secret

# Session cookie key
KEY=connect.sid

# Optional: Server port (default: 8888)
PORT=8888

# Optional: Environment mode
NODE_ENV=development
```

### 4. Start the Application

**Development mode (both frontend and backend with hot-reload):**

```bash
pnpm dev
```

**Start only backend:**

```bash
cd backend && pnpm dev
```

**Start only frontend:**

```bash
cd frontend && pnpm dev
```

### 5. Access the Application

- 🌐 **Frontend**: [http://localhost:5173](http://localhost:5173)
- 📡 **Backend API**: [http://localhost:8888/api](http://localhost:8888/api)
- 📖 **API Documentation**: [http://localhost:8888/api-docs](http://localhost:8888/api-docs)

---

## 📂 Project Structure

```
access-review-system/
├── backend/                          # Express.js REST API
│   ├── controllers/                  # Business logic
│   ├── routes/                       # API endpoints
│   ├── models/                       # Mongoose schemas
│   ├── handlers/                     # Error handling
│   ├── tests/
│   │   ├── unit/                     # Unit tests
│   │   ├── integration/              # Integration tests
│   │   └── performance/              # Performance tests
│   ├── docs/                         # Swagger configuration
│   ├── seeder/                       # Database seeding
│   ├── setup/                        # Initialization scripts
│   ├── app.js                        # Express app setup
│   ├── server.js                     # Server entry point
│   └── package.json
│
├── frontend/                         # React + TypeScript application
│   ├── src/
│   │   ├── components/               # Reusable components
│   │   ├── pages/                    # Page components
│   │   ├── services/                 # API service clients
│   │   ├── types/                    # TypeScript interfaces
│   │   ├── assets/                   # Images, icons, etc.
│   │   ├── App.tsx                   # Root component
│   │   └── main.tsx                  # Entry point
│   ├── public/                       # Static files
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
├── .husky/                           # Git hooks
├── package.json                      # Root monorepo config
├── pnpm-workspace.yaml               # Monorepo configuration
└── README.md
```

---

## 📚 Core API Endpoints

### Authentication

| Method | Endpoint        | Auth | Description                 |
| ------ | --------------- | ---- | --------------------------- |
| POST   | `/api/login`    | ❌   | Login and receive JWT token |
| POST   | `/api/register` | ❌   | Register a new user         |
| POST   | `/api/logout`   | ✅   | Logout current user         |

### Public Spaces

| Method | Endpoint                         | Auth | Description            |
| ------ | -------------------------------- | ---- | ---------------------- |
| POST   | `/api/public-space/create`       | ✅   | Create a public space  |
| GET    | `/api/public-space/list`         | ❌   | List all public spaces |
| GET    | `/api/public-space/search/:name` | ❌   | Search spaces by name  |
| PATCH  | `/api/public-space/update/:id`   | ✅   | Update space details   |
| DELETE | `/api/public-space/delete/:id`   | ✅   | Delete a space         |

### Accessibility Reviews

| Method | Endpoint                             | Auth | Description                    |
| ------ | ------------------------------------ | ---- | ------------------------------ |
| POST   | `/api/review/create`                 | ✅   | Create an accessibility review |
| GET    | `/api/review/list`                   | ❌   | List reviews with filters      |
| GET    | `/api/review/space/:spaceId`         | ❌   | Get reviews for a space        |
| GET    | `/api/review/space/:spaceId/summary` | ❌   | Get accessibility summary      |
| GET    | `/api/review/space/:spaceId/weather` | ❌   | Get weather for location       |
| GET    | `/api/review/my-reviews`             | ✅   | Get current user's reviews     |
| PATCH  | `/api/review/update/:id`             | ✅   | Update review (owner only)     |
| DELETE | `/api/review/delete/:id`             | ✅   | Delete review                  |

### Access Features

| Method | Endpoint                   | Auth | Description    |
| ------ | -------------------------- | ---- | -------------- |
| POST   | `/api/access-features`     | ✅   | Create feature |
| GET    | `/api/access-features`     | ❌   | List features  |
| PUT    | `/api/access-features/:id` | ✅   | Update feature |
| DELETE | `/api/access-features/:id` | ✅   | Delete feature |

### User Management

| Method | Endpoint                        | Auth | Description            |
| ------ | ------------------------------- | ---- | ---------------------- |
| GET    | `/api/user/read/:id`            | ✅   | Get user profile       |
| PATCH  | `/api/user/update/:id`          | ✅   | Update profile         |
| PATCH  | `/api/user/password-update/:id` | ✅   | Change password        |
| GET    | `/api/user/search`              | ✅   | Search users           |
| GET    | `/api/user/list`                | ✅   | List users (paginated) |

See [API Documentation](backend/README.md) for detailed endpoint specifications.

---

## 🧪 Testing

### Run All Tests

```bash
pnpm test
```

### Run Test Suites

```bash
# Unit tests only
pnpm test:unit

# Integration tests only
pnpm test:integration

# Performance tests (Artillery)
pnpm test:performance
```

### Test Coverage

Tests are located in:

- **Unit tests**: `backend/tests/unit/`
- **Integration tests**: `backend/tests/integration/`
- **Performance tests**: `backend/tests/performance/`

---

## 🔧 Available Commands

### Root Commands (Monorepo)

```bash
# Development: Start all services with hot-reload
pnpm dev

# Production: Start services in production mode
pnpm start

# Code formatting
pnpm format           # Auto-fix formatting
pnpm format:check     # Check formatting without changes
```

### Backend Commands

```bash
cd backend

pnpm start            # Start server
pnpm dev              # Start with nodemon (auto-reload)
pnpm test             # Run all tests
pnpm test:unit        # Unit tests
pnpm test:integration # Integration tests
pnpm test:performance # Performance tests
pnpm setup            # Initialize database
```

### Frontend Commands

```bash
cd frontend

pnpm dev              # Start development server
pnpm build            # Build for production
pnpm preview          # Preview production build
pnpm lint             # Run ESLint
```

---

## 🔐 Authentication

The system uses **JWT (JSON Web Tokens)** for stateless authentication.

### How It Works

1. **Register/Login**: POST to `/api/register` or `/api/login`
2. **Receive Token**: Get `x-auth-token` from response
3. **Include Header**: Add token to all protected requests:
   ```
   x-auth-token: your-jwt-token-here
   ```
4. **Server Validates**: Middleware verifies token and injects user data into request

### User Roles

- **Admin**: Full system access, moderation capabilities
- **User**: Can create reviews, manage own content
- **Guest**: Read-only access to public data

---

## 💾 Data Models

### User

- Email (unique, required)
- Password (bcrypted)
- Full name (name, surname)
- User type (admin, user, guest)
- Account status (enabled, removed flags)

### PublicSpace

- Name, address, coordinates
- Category (Mall, Park, Hospital, Station, Other)
- Description, image URL
- Timestamps

### AccessFeature

- Name, description (unique)
- Category (Mobility, Visual, Auditory, Cognitive, Other)
- Active status
- Created by (user reference)

### AccessibilityReview

- Rating (1-5 scale)
- Comment (10-1000 characters)
- Features array with availability and condition
- Space and user references
- Timestamps, soft delete flag

---

## 🤝 Contributing

We love your input! We want to make contributing to this project as easy and transparent as possible.

### Getting Started

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Make** your changes
4. **Commit** with clear messages: `git commit -m 'Add amazing feature'`
5. **Push** to your branch: `git push origin feature/amazing-feature`
6. **Open** a Pull Request

### Development Guidelines

- Follow the existing code style
- Write tests for new features
- Update documentation as needed
- Use meaningful commit messages
- Ensure all tests pass: `pnpm test`
- Run formatting before committing: `pnpm format`

### Pre-commit Hooks

This project uses **Husky** for git hooks. Before committing:

- Code is automatically checked for formatting issues
- Commits are prevented if formatting fails
- Auto-fix with: `pnpm format`

---

## 📖 Documentation

- **[Backend API Documentation](backend/README.md)** - Detailed API reference, models, and usage
- **[Frontend Documentation](frontend/README.md)** - React, TypeScript, and Vite setup
- **[Swagger UI](http://localhost:8888/api-docs)** - Interactive API documentation (when server is running)

---

## 🐛 Reporting Issues

Found a bug? Please open an [issue](https://github.com/ModithaM/access-review-system/issues) with:

- Clear description of the problem
- Steps to reproduce
- Expected vs. actual behavior
- Screenshots/logs if applicable
- Your environment (OS, Node version, etc.)

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

**Developed by:** Computer Science Students (Capstone Project)

<table>
<tr>
<td align="center">
  <a href="https://github.com/ModithaM">
    <img src="https://avatars.githubusercontent.com/ModithaM?v=4" width="80" alt="Moditha"/>
    <br><b>Moditha Marasingha</b>
    <br>Full-Stack Developer
  </a>
</td>
<td align="center">
  <a href="https://github.com/anupaprabhasara">
    <img src="https://avatars.githubusercontent.com/anupaprabhasara?v=4" width="80" alt="Anupa"/>
    <br><b>Anupa Prabhasara</b>
    <br>Frontend Developer
  </a>
</td>
<td align="center">
  <a href="https://github.com/nipun-munasinghe">
    <img src="https://avatars.githubusercontent.com/nipun-munasinghe?v=4" width="80" alt="Nipun"/>
    <br><b>Nipun Munasinghe</b>
    <br>Backend Developer
  </a>
</td>
<td align="center">
  <a href="https://github.com/hasindu1998">
    <img src="https://avatars.githubusercontent.com/hasindu1998?v=4" width="80" alt="Hasindu"/>
    <br><b>Hasindu Sankalpa</b>
    <br>DevOps & Testing
  </a>
</td>
</tr>
</table>

---

## 🙏 Acknowledgments

This project was developed as part of a Computer Science capstone course to demonstrate full-stack web development skills and best practices.

**External Resources:**

- [Open Meteo API](https://open-meteo.com/) - For weather data integration
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - Database hosting
- [Swagger/OpenAPI](https://swagger.io/) - API documentation
- [OWASP](https://owasp.org/) - Security best practices

---

## 📞 Support & Questions

For questions about the project:

- 📖 Check our [documentation](backend/README.md)
- 🔍 Search [existing issues](https://github.com/ModithaM/access-review-system/issues)
- 💬 Open a new [discussion](https://github.com/ModithaM/access-review-system/discussions)

---

<div align="center">

**Educational Project** | Open Source | MIT License

Made with ❤️ by Computer Science students

⭐ If you find this project useful for learning, please consider giving us a star!

</div>
