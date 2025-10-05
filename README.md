# Trial Issue Tracker

A full-stack application for tracking issues discovered during clinical trial site visits.

**Live Demo:** http://56.228.25.13:5173  
**Credentials:** admin / admin123

---

## Prerequisites

- Docker (20.10+)
- Docker Compose (2.0+)

Install Docker: https://docs.docker.com/get-docker/

---

## Local Setup

```bash
# Clone repository
git clone <repository-url>
cd trial-issue-log

# Start all services (database, backend, frontend)
docker-compose up -d --build

# View logs (optional)
docker-compose logs -f

# Stop all services
docker-compose down

# Fresh start (removes all data)
docker-compose down -v
```

**Access the application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/health

**Default login:** admin / admin123

---

## Running Tests

```bash
# Run unit tests
docker exec -it trial-issues-backend npm test

# Run with coverage
docker exec -it trial-issues-backend npm run test:coverage
```

**Test coverage:** Input validation middleware (27 test cases)

---

## Tech Stack

**Backend:** Node.js, Express, MySQL  
**Frontend:** React, Vite, React Router  
**DevOps:** Docker, Docker Compose, AWS EC2

---

## Things I left outdside (Future/production)
 - HTTPS - via nginx
 - Deployment - I went with AWS instance since it's faster and can use the same docker-compose way, If I had more time (1-2 hours) I would go with ECR + ECS + managed RDS
 - Security scan (SNYK)
 - More validations (i.e. - CSV)
 - More tests (+frontend ones)
 - Pegination (Server side)
 - Proper OAUTH (Keycloak?)
 - Multi-tenant - I assume users should have access to their tenant only
 - HA
 - Auto-scaling


