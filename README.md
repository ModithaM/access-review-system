# Access Review System - Backend API

Node.js + Express + MongoDB backend for a Public Space Accessibility platform.  
The system supports authentication, user management, public-space management, access-feature cataloging, and accessibility reviews (including weather context from Open-Meteo).

---

## 1) Project Overview

This API allows users to:

- Register and log in with JWT authentication.
- Manage user accounts (read, update, password update, list/search).
- Manage public spaces (create, list, update, delete, search by name).
- Manage accessibility features (create, list, update, soft delete).
- Create and manage accessibility reviews with validation, ownership checks, and analytics.
- Retrieve weather context for a public space based on stored coordinates.

### Core Modules

1. Authentication & Authorization
2. User Management
3. Public Space Management
4. Access Feature Management
5. Accessibility Review Management

---
