# Inventory & Order Management System

Full-stack inventory and order management assessment project using React, FastAPI, PostgreSQL, Docker, and Docker Compose.

## Features

- Product CRUD with unique SKU validation and non-negative stock.
- Customer create/list/detail/delete with unique email validation.
- Order create/list/detail/delete with automatic backend total calculation.
- Inventory protection: orders are rejected when stock is insufficient.
- Stock is reduced on order creation and restored when orders are canceled/deleted.
- Responsive React dashboard with product, customer, order, and low-stock summaries.

## Stack

- Frontend: React, Vite, JavaScript
- Backend: Python, FastAPI, SQLAlchemy
- Database: PostgreSQL
- Containers: Docker, Docker Compose

## API Endpoints

- `GET /health`
- `GET /dashboard`
- `POST /products`
- `GET /products`
- `GET /products/{id}`
- `PUT /products/{id}`
- `DELETE /products/{id}`
- `POST /customers`
- `GET /customers`
- `GET /customers/{id}`
- `DELETE /customers/{id}`
- `POST /orders`
- `GET /orders`
- `GET /orders/{id}`
- `DELETE /orders/{id}`

## Run Locally With Docker

Copy the sample environment file and adjust values as needed:

```bash
cp .env.example .env
```

Start the full system:

```bash
docker compose up --build
```

Open:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API docs: http://localhost:8000/docs

## Environment Variables

Backend:

- `DATABASE_URL`: PostgreSQL connection string.

Docker Compose:

- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `VITE_API_URL`

Frontend:

- `VITE_API_URL`: Public backend API URL used at build time.

## Deployment Notes

Suggested free deployment setup:

1. Push this repository to GitHub.
2. Deploy PostgreSQL and the FastAPI backend on Render, Railway, or Fly.io.
3. Set backend `DATABASE_URL` to the hosted PostgreSQL connection string.
4. Build and push the backend image to Docker Hub:

```bash
docker build -t <dockerhub-user>/inventory-backend:latest ./backend
docker push <dockerhub-user>/inventory-backend:latest
```

5. Deploy the React frontend on Vercel or Netlify.
6. Set frontend `VITE_API_URL` to the live backend URL.

## Submission Links

- GitHub repository: add after publishing
- Docker Hub backend image: add after pushing
- Live frontend URL: add after deployment
- Live backend API URL: add after deployment
