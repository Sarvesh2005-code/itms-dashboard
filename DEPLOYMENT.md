# ITMS Dashboard - Deployment Guide

## Prerequisites

### System Requirements
- **Python 3.8+** (3.11+ recommended)
- **Node.js 16+** (18+ recommended)
- **npm** or **yarn**
- **Git** (optional, for cloning)

### Hardware Requirements
- **Minimum:** 1 CPU core, 2GB RAM, 1GB storage
- **Recommended:** 2+ CPU cores, 4GB RAM, 5GB storage

## Quick Start

### 1. Clone or Download the Project
```bash
git clone <repository-url>
cd ITMS-3
```

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python run.py
```
Backend will be available at: http://localhost:8000

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend will be available at: http://localhost:5173

### 4. Test the API
```bash
cd ..
python test_api.py
```

## Production Deployment

### Backend (FastAPI) Production Setup

#### Option 1: Direct Deployment
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

#### Option 2: Using Gunicorn (Recommended)
```bash
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

#### Option 3: Docker Deployment
Create `backend/Dockerfile`:
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t itms-backend .
docker run -p 8000:8000 -v $(pwd)/data:/app/data itms-backend
```

### Frontend (React) Production Setup

#### Option 1: Static Build with Nginx
```bash
cd frontend
npm run build

# Copy dist/ folder to web server
# Configure nginx to serve static files
```

#### Option 2: Docker Deployment
Create `frontend/Dockerfile`:
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```

#### Option 3: PM2 (Development/Small Production)
```bash
npm install -g pm2
npm run build
pm2 serve dist 3000 --name "itms-frontend"
```

## Environment Configuration

### Backend Environment Variables
Create `backend/.env`:
```env
# Database
DATABASE_URL=sqlite:///./itms_data.db

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://your-domain.com

# Logging
LOG_LEVEL=INFO

# Security
API_SECRET_KEY=your-secret-key-here
```

### Frontend Environment Variables
Create `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_REFRESH_INTERVAL=5000
```

## Reverse Proxy Setup (Nginx)

Create `/etc/nginx/sites-available/itms`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/itms/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/itms /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## SSL/HTTPS Setup

### Using Let's Encrypt (Certbot)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Database Configuration

### SQLite (Default)
- File-based database
- Stored in `backend/itms_data.db`
- Suitable for small to medium deployments

### PostgreSQL (Production)
1. Install PostgreSQL
2. Update `backend/app/database.py`:
```python
DATABASE_URL = "postgresql://user:password@localhost:5432/itms_db"
```
3. Install psycopg2: `pip install psycopg2-binary`

### MySQL/MariaDB
1. Install MySQL/MariaDB
2. Update database URL:
```python
DATABASE_URL = "mysql+pymysql://user:password@localhost:3306/itms_db"
```
3. Install PyMySQL: `pip install pymysql`

## Monitoring and Logging

### Application Logs
- Backend logs: Check uvicorn/gunicorn logs
- Frontend logs: Browser developer console
- API access logs: Nginx access logs

### Health Monitoring
- Backend health: `GET /health`
- API status: `GET /`
- Database status: Check database connection

### Performance Monitoring
- Use tools like Prometheus + Grafana
- Monitor API response times
- Track database query performance

## Security Considerations

### Backend Security
1. **API Rate Limiting**: Implement rate limiting for API endpoints
2. **Authentication**: Add API key authentication for production
3. **CORS**: Configure CORS properly for your domain
4. **Input Validation**: Ensure all sensor data is validated
5. **HTTPS**: Always use HTTPS in production

### Frontend Security
1. **Content Security Policy (CSP)**
2. **Secure Headers**: X-Frame-Options, X-Content-Type-Options
3. **Environment Variables**: Never expose sensitive data

## Backup and Recovery

### Database Backup
```bash
# SQLite backup
cp backend/itms_data.db backup/itms_data_$(date +%Y%m%d_%H%M%S).db

# PostgreSQL backup
pg_dump itms_db > backup/itms_db_$(date +%Y%m%d_%H%M%S).sql
```

### Automated Backups
Create a cron job:
```bash
0 2 * * * /path/to/backup-script.sh
```

## Troubleshooting

### Common Issues

#### Backend Issues
- **Module not found**: Ensure all dependencies are installed
- **Database connection**: Check database URL and permissions
- **Port conflicts**: Ensure port 8000 is available

#### Frontend Issues
- **Build failures**: Check Node.js version and dependencies
- **API connection**: Verify backend is running and CORS is configured
- **Asset loading**: Check base URL configuration

#### NodeMCU Integration
- **Connection timeouts**: Check network connectivity
- **Data format errors**: Verify JSON format matches expected schema
- **Sensor data parsing**: Check sensor data string format

### Debug Mode
Enable debug logging:
```bash
# Backend
LOG_LEVEL=DEBUG python run.py

# Frontend
npm run dev -- --debug
```

### Performance Issues
- Monitor database query performance
- Check API response times
- Optimize chart rendering for large datasets
- Implement data pagination for historical views

## Scaling

### Horizontal Scaling
- Load balance multiple backend instances
- Use database clustering
- Implement Redis for session management

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Implement caching strategies

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review application logs
3. Test with sample data using `test_api.py`
4. Verify network connectivity between components