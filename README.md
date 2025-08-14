# 💜 ConnectHub - Social Media & Dating Platform

A comprehensive social media and dating application built for web, iOS, and Android platforms with modern technology stack and advanced features.

## 🚀 Features

### Social Media Features
- **User Authentication**: Secure login/registration with JWT tokens
- **News Feed**: Create, like, comment, and share posts
- **Image Sharing**: Photo upload and sharing capabilities
- **User Profiles**: Customizable profiles with personal information
- **Real-time Notifications**: Instant notifications for interactions
- **Social Interactions**: Follow/unfollow users, like posts, comments

### Dating Features
- **Profile Discovery**: Swipe through dating profiles
- **Smart Matching**: Algorithm-based profile matching
- **Real-time Messaging**: Instant messaging between matched users
- **Location-based Discovery**: Find users nearby
- **Privacy Controls**: Advanced privacy and safety settings

### Security Features
- **JWT Authentication**: Secure token-based authentication
- **Password Encryption**: Bcrypt password hashing
- **Data Validation**: Comprehensive input validation
- **Rate Limiting**: API rate limiting for security
- **Content Moderation**: Built-in content safety features

## 🏗️ Architecture

### Backend (Node.js/TypeScript)
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Real-time**: Socket.io for live messaging
- **Caching**: Redis for session management
- **Security**: Helmet, CORS, rate limiting
- **Email**: SMTP integration for notifications

### Frontend (Web)
- **Technologies**: HTML5, CSS3, JavaScript (ES6+)
- **Design**: Responsive, mobile-first approach
- **UI/UX**: Modern interface with smooth animations
- **API Integration**: RESTful API consumption

### Mobile (React Native)
- **Framework**: React Native 0.72+
- **Navigation**: React Navigation 6
- **State Management**: Redux Toolkit
- **Cross-platform**: Single codebase for iOS & Android
- **Native Features**: Camera, location, biometrics

## 📱 Platform Support

- **Web**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **iOS**: iOS 12+ (iPhone, iPad)
- **Android**: Android 8+ (API Level 26+)

## 🛠️ Technology Stack

### Backend
```
- Node.js 18+
- Express.js 4.18+
- TypeScript 5.0+
- Prisma ORM 5.0+
- PostgreSQL 14+
- Redis 7.0+
- Socket.io 4.7+
- JWT Authentication
- Bcrypt encryption
- Nodemailer
```

### Frontend Web
```
- HTML5
- CSS3 (Flexbox, Grid)
- JavaScript ES6+
- Responsive Design
- PWA capabilities
```

### Mobile (React Native)
```
- React Native 0.72+
- React Navigation 6+
- Redux Toolkit
- AsyncStorage
- React Native Vector Icons
- Native device features
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database
- Redis server
- Git

### Backend Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd ConnectHub-Backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Configuration**
```bash
cp .env.example .env
# Edit .env with your database credentials and API keys
```

4. **Database Setup**
```bash
npx prisma generate
npx prisma db push
```

5. **Start the server**
```bash
npm run dev
```

The backend will be running at `http://localhost:5000`

### Frontend Web Setup

1. **Navigate to frontend directory**
```bash
cd ConnectHub-Frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm start
```

The web app will be available at `http://localhost:3000`

### Mobile App Setup

1. **Navigate to mobile directory**
```bash
cd ConnectHub-Mobile
```

2. **Install dependencies**
```bash
npm install
```

3. **iOS Setup (macOS only)**
```bash
cd ios && pod install
cd ..
npm run ios
```

4. **Android Setup**
```bash
npm run android
```

## 📁 Project Structure

```
ConnectHub/
├── ConnectHub-Backend/          # Node.js/Express API server
│   ├── src/
│   │   ├── config/             # Configuration files
│   │   ├── middleware/         # Custom middleware
│   │   ├── routes/             # API routes
│   │   ├── services/           # Business logic
│   │   ├── types/              # TypeScript definitions
│   │   └── server.ts           # Main server file
│   ├── prisma/                 # Database schema
│   └── package.json
├── ConnectHub-Frontend/         # Web application
│   ├── src/
│   │   ├── css/                # Stylesheets
│   │   ├── js/                 # JavaScript files
│   │   └── assets/             # Images, icons
│   ├── index.html              # Main HTML file
│   └── package.json
├── ConnectHub-Mobile/           # React Native mobile app
│   ├── src/                    # Source code
│   ├── android/                # Android configuration
│   ├── ios/                    # iOS configuration
│   ├── App.js                  # Main app component
│   └── package.json
└── Test-project/               # Development plans & guides
```

## 🔧 Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/connecthub
JWT_SECRET=your-jwt-secret
REDIS_URL=redis://localhost:6379
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password
```

## 📱 Mobile App Features

### Authentication
- Secure login/signup with biometric support
- JWT token storage
- Auto-login functionality

### Social Feed
- Infinite scroll posts feed
- Create posts with images
- Like, comment, share functionality
- Pull-to-refresh

### Dating Section
- Tinder-like card interface
- Swipe gestures for like/pass
- Profile details view
- Match notifications

### Messaging
- Real-time chat interface
- Message history
- Unread message indicators
- Push notifications

### Profile Management
- Edit profile information
- Settings and preferences
- Logout functionality

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS configuration
- SQL injection prevention
- XSS protection

## 🌐 API Documentation

### Authentication Endpoints
```
POST /api/v1/auth/register - User registration
POST /api/v1/auth/login - User login
POST /api/v1/auth/logout - User logout
GET /api/v1/auth/verify - Verify token
```

### Social Media Endpoints
```
GET /api/v1/posts - Get posts feed
POST /api/v1/posts - Create new post
PUT /api/v1/posts/:id - Update post
DELETE /api/v1/posts/:id - Delete post
POST /api/v1/posts/:id/like - Like/unlike post
```

### Dating Endpoints
```
GET /api/v1/dating/discover - Get dating profiles
POST /api/v1/dating/swipe - Swipe on profile
GET /api/v1/dating/matches - Get matches
```

### Messaging Endpoints
```
GET /api/v1/messages - Get conversations
POST /api/v1/messages - Send message
GET /api/v1/messages/:id - Get conversation
```

## 🧪 Testing

Run the test suite:
```bash
# Backend tests
cd ConnectHub-Backend
npm test

# Frontend tests
cd ConnectHub-Frontend
npm test

# Mobile tests
cd ConnectHub-Mobile
npm test
```

## 📈 Performance Optimization

- Redis caching for frequent queries
- Image optimization and compression
- Lazy loading implementation
- Database indexing
- API response compression
- CDN integration ready

## 🚀 Deployment

### Backend Deployment
- Supports Docker containerization
- Environment-based configuration
- PM2 process management
- Nginx reverse proxy ready

### Frontend Deployment
- Static file hosting (Netlify, Vercel)
- PWA capabilities
- Service worker for offline functionality

### Mobile Deployment
- iOS App Store ready
- Google Play Store ready
- Over-the-air updates support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

Built with comprehensive planning and modern development practices for a scalable, secure, and user-friendly social media and dating platform.

## 🔮 Roadmap

- [ ] Video calling integration
- [ ] AI-powered matching algorithm
- [ ] Advanced content moderation
- [ ] Multi-language support
- [ ] Analytics dashboard
- [ ] Premium features
- [ ] Group messaging
- [ ] Stories feature
- [ ] Live streaming
- [ ] Advanced search filters

## 📞 Support

For support and questions, please open an issue in the repository or contact the development team.

---

**ConnectHub** - Connecting hearts and minds in the digital age! 💜
