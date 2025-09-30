# Intelligent Track Monitoring System (ITMS) Dashboard

A comprehensive web-based dashboard for real-time railway track monitoring using sensor data from NodeMCU ESP8266MOD. The system provides real-time visualization, fault detection, historical data analysis, and alert management for railway track safety.

![ITMS Dashboard](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-blue)
![React](https://img.shields.io/badge/React-18+-61DAFB)
![SQLite](https://img.shields.io/badge/Database-SQLite-003B57)

## 🚀 Features

### Real-time Monitoring
- **Live Sensor Readings**: Real-time display of IR, vibration, ultrasonic, and MPU6050 readings
- **Auto-refresh**: Configurable polling intervals (1-60 seconds)
- **Connection Status**: Visual indicators for system connectivity
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### Intelligent Fault Detection
- **Multi-sensor Analysis**: Automated fault detection based on configurable thresholds
- **Severity Classification**: Critical, Major, and Minor fault categories
- **Real-time Alerts**: Instant notifications with visual and sound alerts
- **Alert Management**: Dismiss, resolve, and track fault resolution

### Data Visualization
- **Interactive Charts**: Real-time line charts for sensor trends
- **Historical Analysis**: Time-series data with multiple time ranges (1h, 6h, 24h, 7d)
- **Multi-axis Visualization**: Separate charts for different sensor types
- **Export Capabilities**: CSV export for reporting and analysis

### Advanced Analytics
- **Statistical Dashboard**: Total readings, fault rates, and trends
- **Historical Data Management**: Complete sensor reading history with search and filters
- **Fault Log System**: Detailed fault tracking with timestamps and descriptions
- **Performance Metrics**: System uptime, data quality, and sensor health

## 🏗️ Architecture

```
ITMS-3/
├── backend/          # FastAPI backend server
│   ├── app/
│   │   ├── main.py           # FastAPI application
│   │   ├── models.py         # Database models
│   │   ├── database.py       # Database configuration
│   │   ├── api/              # API routes
│   │   └── utils/            # Utility functions
│   ├── requirements.txt      # Python dependencies
│   └── run.py               # Development server runner
├── frontend/         # React dashboard
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/           # Dashboard pages
│   │   ├── hooks/           # Custom React hooks
│   │   └── utils/           # Utility functions
│   ├── package.json
│   └── public/
└── README.md         # This file
```

## 📊 Data Flow

```
[Arduino Sensors] → [NodeMCU] → [HTTP POST] → [FastAPI Backend] → [SQLite DB]
                                                            ↓
[React Dashboard] ← [REST API] ← [Real-time Processing] ← [Fault Detection]
```

**Processing Pipeline:**
1. Arduino reads sensor data and calculates initial fault flags
2. NodeMCU receives serial data, formats as JSON, sends HTTP POST
3. Backend validates and parses sensor data
4. Fault detection algorithms analyze readings against thresholds
5. Data stored in SQLite database with processed fault information
6. Frontend polls backend API for real-time updates
7. Dashboard displays live data, charts, and alerts

## 📱 Sensor Integration

### Supported Sensors

| Sensor | Type | Purpose | Data Format | Fault Conditions |
|--------|------|---------|-------------|------------------|
| **IR Sensor** | Digital | Track obstruction detection | `IR:0/1` | 1 = Obstruction detected |
| **SW-420** | Analog | Vibration monitoring | `VIB_RAW:0-1023` | 400-450 = Fault threshold |
| **HC-SR04** | Digital | Distance measurement | `DIST_ADJ:0-400` | <5cm or >50cm = Out of range |
| **MPU6050** | I2C | Acceleration/Gyro | `ACC:x,y,z` | >1000 = Unusual movement |

### Sample NodeMCU JSON Payload
```json
{
  "sensorData": "IR:1,VIB_RAW:435,DIST_ADJ:18,ACC:123,456,789,FAULT:1",
  "timestamp": "2025-09-28T12:00:00"
}
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+ (3.11+ recommended)
- Node.js 16+ (18+ recommended)
- npm or yarn

### 1. Clone and Setup
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

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Access the Dashboard
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### 5. Test with Sample Data
```bash
python test_api.py
```

## 💻 Technology Stack

### Backend
- **FastAPI** - Modern, fast Python web framework with automatic API documentation
- **SQLAlchemy** - SQL toolkit and ORM for Python
- **SQLite** - Lightweight, serverless database (production-ready PostgreSQL/MySQL support)
- **Pydantic** - Data validation using Python type annotations
- **Uvicorn** - ASGI server for production deployment

### Frontend
- **React 18** - Modern JavaScript library for building user interfaces
- **TypeScript** - Typed superset of JavaScript for better development experience
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **Chart.js** - Simple yet flexible JavaScript charting library
- **Lucide React** - Beautiful & consistent icon library
- **Axios** - Promise-based HTTP client for API communication

### Development & Deployment
- **Python 3.8+** - Backend runtime
- **Node.js 16+** - Frontend build tools and runtime
- **Docker** - Containerization support
- **Nginx** - Reverse proxy and static file serving
- **PM2** - Process manager for Node.js applications

## 📡 API Endpoints

### Core Endpoints
- `GET /` - Health check and API information
- `GET /health` - Detailed system health status
- `POST /api/sensor-data` - Receive sensor data from NodeMCU
- `GET /api/dashboard` - Complete dashboard data in one request

### Data Retrieval
- `GET /api/sensor-data/latest` - Get most recent sensor reading
- `GET /api/sensor-data` - Historical sensor data with pagination
- `GET /api/faults` - Fault logs with filtering options
- `GET /api/stats` - Sensor statistics and metrics

### Fault Management
- `PUT /api/faults/{fault_id}/resolve` - Mark fault as resolved

### API Documentation
Interactive API documentation available at: `http://localhost:8000/docs`

## 📋 Dashboard Features

### Main Dashboard
- **System Status Indicator**: Real-time connection status with visual feedback
- **Statistics Overview**: Total readings, active faults, fault rate, daily detections
- **Live Sensor Cards**: Real-time sensor values with color-coded status
- **Recent Faults Table**: Latest fault events with severity and resolution status
- **Quick Actions**: Data export, system refresh, settings access

### Historical Data View
- **Tabbed Interface**: Switch between sensor readings and fault logs
- **Advanced Filtering**: Date ranges, severity levels, search functionality
- **Data Export**: CSV export for external analysis
- **Detailed Tables**: Comprehensive data views with sorting and pagination

### Real-time Charts
- **Time Series Visualization**: Interactive charts for sensor trends
- **Multiple Time Ranges**: 1 hour, 6 hours, 24 hours, 7 days
- **Multi-sensor Support**: Separate charts for different sensor types
- **Responsive Design**: Optimized for all screen sizes

### Alert System
- **Real-time Notifications**: Slide-in alerts for new faults
- **Severity-based Styling**: Visual differentiation for fault levels
- **Alert Management**: Dismiss or resolve alerts directly from UI
- **Sound Notifications**: Optional audio alerts for critical faults

## ⚙️ Configuration

### Fault Detection Thresholds
Customizable in `backend/app/utils/sensor_parser.py`:

```python
VIBRATION_THRESHOLD_MIN = 400    # Lower bound for vibration fault
VIBRATION_THRESHOLD_MAX = 450    # Upper bound for vibration fault
DISTANCE_MIN_THRESHOLD = 5.0     # Minimum distance (cm)
DISTANCE_MAX_THRESHOLD = 50.0    # Maximum distance (cm)
ACC_THRESHOLD = 1000             # Acceleration fault threshold
```

### Frontend Configuration
Environment variables in `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_REFRESH_INTERVAL=5000  # Dashboard refresh rate (ms)
VITE_CHART_ANIMATION=true   # Enable chart animations
```

## 📈 Performance & Scalability

### System Performance
- **Real-time Updates**: 5-second polling interval (configurable)
- **Concurrent Users**: Supports multiple simultaneous dashboard users
- **Data Throughput**: Handles continuous sensor data streams
- **Response Times**: <100ms API response times for dashboard data

### Scalability Features
- **Horizontal Scaling**: Multiple backend instances with load balancing
- **Database Options**: SQLite for development, PostgreSQL/MySQL for production
- **Caching**: Redis integration for session management and caching
- **API Rate Limiting**: Configurable rate limits for API endpoints

## 🔒 Security Features

### API Security
- **CORS Configuration**: Configurable cross-origin resource sharing
- **Input Validation**: Comprehensive data validation using Pydantic
- **Error Handling**: Secure error responses without sensitive information
- **HTTP Security Headers**: X-Frame-Options, X-Content-Type-Options

### Data Protection
- **Database Security**: Parameterized queries prevent SQL injection
- **Data Sanitization**: All user inputs are validated and sanitized
- **Audit Trail**: Complete logging of all sensor data and fault events

## 🛠️ Maintenance & Monitoring

### Health Monitoring
- **System Health Checks**: Automated health monitoring endpoints
- **Database Status**: Connection and query performance monitoring
- **API Performance**: Response time and error rate tracking
- **Sensor Connectivity**: Real-time detection of sensor connection issues

### Logging & Debugging
- **Structured Logging**: JSON-formatted logs for easy parsing
- **Debug Mode**: Detailed logging for development and troubleshooting
- **Error Tracking**: Comprehensive error logging and reporting
- **Performance Metrics**: API timing and database query performance

## 🚀 Production Deployment

For detailed production deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)

### Quick Production Setup

#### Using Docker
```bash
# Backend
docker build -t itms-backend ./backend
docker run -p 8000:8000 itms-backend

# Frontend
docker build -t itms-frontend ./frontend
docker run -p 80:80 itms-frontend
```

#### Manual Deployment
```bash
# Backend with Gunicorn
cd backend
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

# Frontend build
cd frontend
npm run build
# Deploy dist/ folder to web server
```

## 🧩 Testing

### Backend Testing
```bash
cd backend
pip install pytest pytest-asyncio
pytest tests/
```

### Frontend Testing
```bash
cd frontend
npm test
```

### API Testing
```bash
# Test with sample data
python test_api.py

# Manual API testing
curl -X POST http://localhost:8000/api/sensor-data \
  -H "Content-Type: application/json" \
  -d '{"sensorData": "IR:0,VIB_RAW:300,DIST_ADJ:25,ACC:50,60,70,FAULT:0", "timestamp": "2025-09-28T12:00:00"}'
```

## 📚 Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Comprehensive deployment guide
- **[API Documentation](http://localhost:8000/docs)** - Interactive API docs (when server is running)
- **Code Comments** - Inline documentation throughout the codebase
- **Type Annotations** - Full TypeScript/Python type coverage

## 🔧 Troubleshooting

### Common Issues

#### Backend Issues
- **ImportError**: Ensure all Python dependencies are installed
- **Database connection**: Check SQLite file permissions
- **Port 8000 in use**: Change port in `run.py` or stop conflicting services

#### Frontend Issues
- **Build failures**: Verify Node.js version (16+ required)
- **API connection errors**: Ensure backend is running on port 8000
- **Chart rendering issues**: Check Chart.js dependencies

#### NodeMCU Integration
- **Connection timeout**: Verify network connectivity and API endpoint
- **Data format errors**: Ensure JSON format matches expected schema
- **Authentication failures**: Check CORS configuration

### Debug Mode
```bash
# Backend debug
LOG_LEVEL=DEBUG python run.py

# Frontend debug
npm run dev
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

### Development Guidelines
- Follow existing code style and conventions
- Add tests for new features
- Update documentation for API changes
- Ensure all tests pass before submitting PR

## 📄 License

MIT License - see LICENSE file for details

## 📧 Support

For issues, questions, or contributions:
1. Check existing issues and documentation
2. Create detailed issue reports with:
   - System information
   - Steps to reproduce
   - Expected vs actual behavior
   - Log files (if applicable)

## 🚀 Roadmap

### Planned Features
- [ ] **Mobile App**: React Native mobile application
- [ ] **Advanced Analytics**: Machine learning-based predictive maintenance
- [ ] **Multi-site Support**: Multiple track monitoring locations
- [ ] **Real-time Streaming**: WebSocket-based real-time updates
- [ ] **Advanced Notifications**: Email/SMS alert integration
- [ ] **User Management**: Multi-user authentication and authorization
- [ ] **GPS Integration**: Location-based monitoring with Neo-6M GPS
- [ ] **Report Generation**: Automated maintenance reports
- [ ] **API Webhooks**: External system integration capabilities
- [ ] **Performance Optimization**: Enhanced caching and data compression

### Version History
- **v1.0.0** - Initial release with core functionality
  - Real-time dashboard
  - Fault detection system
  - Historical data analysis
  - REST API with full documentation
  - Production-ready deployment

---

**Built with ❤️ for railway safety and monitoring**