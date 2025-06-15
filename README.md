# WasteTrack

WasteTrack is a comprehensive waste management and tracking system that helps communities monitor and manage waste disposal, collection points, and inappropriate disposal incidents. The platform features role-based access control, real-time statistics, and an intuitive user interface.

## 🌟 Features

### For Users
- **Interactive Dashboard**: Personalized dashboard with news, education, and health benefits
- **Report Inappropriate Disposal**: Easy-to-use interface for reporting waste disposal violations
- **Collection Points**: Find and view nearby waste collection points
- **Schedule Management**: View and track waste collection schedules
- **Profile Management**: Manage personal information and preferences

### For Administrators
- **Analytics Dashboard**: Real-time statistics and data visualization
- **User Management**: Comprehensive user administration system
- **Role-Based Access Control**: Manage permissions and user roles
- **Collection Point Management**: Add and manage waste collection points
- **Schedule Administration**: Create and manage collection schedules
- **Report Management**: Handle and process inappropriate disposal reports

## 🛠️ Technology Stack

### Frontend
- Vue.js 3
- Pinia for state management
- PrimeVue for UI components
- Vue Router for navigation
- PWA support
- Modern UI with 3D effects and glassmorphism
- Dark/Light theme support

### Backend
- Node.js with NestJS framework
- TypeScript
- JWT Authentication
- Role-based authorization
- File upload handling with Multer
- RESTful API architecture

### Infrastructure
- Docker containerization
- Docker Compose for service orchestration
- Scalable microservices architecture

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Docker and Docker Compose
- Git

### Installation

1. Clone the repository:
   
```bash
git clone https://github.com/PraneeshShetty/WasteTrack.git
cd WasteTrack
```

2. Start the backend services:

```bash
cd EndpointAPI-main
docker-compose up -d
```

3. Start the frontend application:

```bash
cd ../wastetrack-main
npm install
npm run dev
```

## 📱 Application Structure

### Frontend (wastetrack-main)
- Modern responsive design
- Role-based dashboards
- Secure authentication flow
- Interactive data visualization
- Progressive Web App (PWA) features

### Backend (EndpointAPI-main)
- Modular architecture
- Secure API endpoints
- File upload handling
- Statistical data processing
- User and role management

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- Secure file upload validation
- Input sanitization
- Error handling and validation

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- PrimeVue for the excellent UI components
- NestJS team for the robust backend framework
- All contributors who have helped shape this project

---
