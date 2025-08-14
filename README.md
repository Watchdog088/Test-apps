# ConnectHub - Social Media & Dating App

ConnectHub is a comprehensive social media and dating platform that combines the best features of social networking and online dating. Built with modern web technologies, it offers a seamless experience for users to connect, share, and find meaningful relationships.

## 🚀 Features

### Social Media Features
- **User Profiles**: Complete user profiles with photos, bio, and statistics
- **Post Creation**: Share text, images, and videos with your network
- **News Feed**: Personalized feed with "For You" and "Following" sections
- **Interactions**: Like, comment, share, and save posts
- **Real-time Notifications**: Stay updated with activities and mentions
- **Direct Messaging**: Private conversations with other users
- **Search & Discovery**: Find users and content across the platform

### Dating Features
- **Profile Discovery**: Swipe-style interface to discover potential matches
- **Smart Matching**: AI-powered matching based on interests and compatibility
- **Interest Tags**: Display and match based on common interests
- **Dating Chat**: Dedicated messaging for matched users
- **Match Management**: View and manage your matches
- **Date Planning**: Integrated tools for planning dates

### Technical Features
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Real-time Updates**: Live updates for messages and notifications
- **Progressive Web App**: App-like experience with offline capabilities
- **Secure Authentication**: JWT-based authentication with refresh tokens
- **Media Management**: Image and video upload with optimization
- **Content Moderation**: AI-powered content filtering and safety features

## 🏗 Architecture

### Backend Architecture
```
ConnectHub-Backend/
├── src/
│   ├── config/         # Database and app configuration
│   ├── middleware/     # Authentication, validation, error handling
│   ├── routes/         # API route handlers
│   ├── types/          # TypeScript type definitions
│   ├── services/       # Business logic and external services
│   └── server.ts       # Main server file
├── prisma/             # Database schema and migrations
└── package.json        # Dependencies and scripts
```

### Frontend Architecture
```
ConnectHub-Frontend/
├── src/
│   ├── css/           # Stylesheets
│   └── js/            # JavaScript application logic
├── index.html         # Main HTML file
└── package.json       # Dependencies and scripts
```

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens with bcrypt
- **Validation**: Joi validation library
- **Logging**: Winston logging framework
- **Email**: Nodemailer for transactional emails
- **Security**: Helmet, CORS, rate limiting

### Frontend
- **Languages**: HTML5, CSS3, ES6+ JavaScript
- **Styling**: CSS Custom Properties (CSS Variables)
- **Icons**: Font Awesome
- **Images**: Unsplash API for demo content
- **PWA**: Service Worker ready
- **Responsive**: Mobile-first design approach

### Infrastructure
- **Containerization**: Docker support
- **Process Management**: PM2
- **Environment**: Development, staging, production configs
- **Monitoring**: Health checks and logging

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

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
```

Edit `.env` with your configuration:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/connecthub"

# JWT Secrets
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Application
NODE_ENV="development"
PORT=3001
CLIENT_URL="http://localhost:3000"

# Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH="uploads/"
```

4. **Database Setup**
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database (optional)
npx prisma db seed
```

5. **Start the server**
```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

### Frontend Setup

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
npm run dev
```

4. **Build for production**
```bash
npm run build
```

## 🚀 Running the Application

### Development Mode
1. Start the backend server: `cd ConnectHub-Backend && npm run dev`
2. Start the frontend server: `cd ConnectHub-Frontend && npm run dev`
3. Open your browser to `http://localhost:3000`

### Production Mode
1. Build both applications: `npm run build` in both directories
2. Start the backend: `cd ConnectHub-Backend && npm start`
3. Serve the frontend through a web server (nginx, Apache, etc.)

## 📱 Usage

### Getting Started
1. **Registration**: Create a new account with email verification
2. **Profile Setup**: Complete your profile with photos and information
3. **Explore**: Browse the social feed and discover new content
4. **Connect**: Follow other users and engage with their content
5. **Date**: Switch to dating mode to find potential matches

### Social Features
- **Creating Posts**: Click the post input or "+" button to create content
- **Interacting**: Like, comment, and share posts from your feed
- **Messaging**: Use the messages section for private conversations
- **Notifications**: Stay updated with the notifications panel

### Dating Features
- **Discovery**: Swipe through potential matches in the dating section
- **Matching**: Like profiles to potentially create matches
- **Chatting**: Message your matches through the dating chat feature
- **Profile Management**: Update your dating preferences and information

## 🔧 API Documentation

### Authentication Endpoints
```
POST /api/auth/register     - Register new user
POST /api/auth/login        - User login
POST /api/auth/logout       - User logout
POST /api/auth/refresh      - Refresh JWT token
POST /api/auth/verify-email - Verify email address
POST /api/auth/forgot-password - Request password reset
POST /api/auth/reset-password  - Reset password
```

### User Endpoints
```
GET    /api/users/profile   - Get user profile
PUT    /api/users/profile   - Update user profile
GET    /api/users/search    - Search users
POST   /api/users/follow    - Follow/unfollow user
GET    /api/users/followers - Get followers list
GET    /api/users/following - Get following list
```

### Posts Endpoints
```
GET    /api/posts          - Get user feed
POST   /api/posts          - Create new post
PUT    /api/posts/:id      - Update post
DELETE /api/posts/:id      - Delete post
POST   /api/posts/:id/like - Like/unlike post
GET    /api/posts/:id/comments - Get post comments
POST   /api/posts/:id/comments - Add comment
```

### Dating Endpoints
```
GET    /api/dating/profiles    - Get potential matches
POST   /api/dating/swipe       - Swipe on profile
GET    /api/dating/matches     - Get user matches
POST   /api/dating/unmatch     - Unmatch with user
PUT    /api/dating/preferences - Update dating preferences
```

### Messages Endpoints
```
GET    /api/messages/conversations - Get user conversations
GET    /api/messages/:conversationId - Get conversation messages
POST   /api/messages/:conversationId - Send message
PUT    /api/messages/:messageId - Mark message as read
DELETE /api/messages/:messageId - Delete message
```

## 🎨 Frontend Components

### Core Components
- **App Container**: Main application shell with navigation
- **Feed System**: Post creation, display, and interaction
- **Dating Interface**: Swipe cards and match management
- **Messaging**: Chat interface with real-time updates
- **Profile Management**: User profile display and editing
- **Notifications**: Alert system with filtering
- **Modals**: Overlay components for various actions

### UI Features
- **Responsive Navigation**: Adaptive menu for all screen sizes
- **Toast Notifications**: Non-intrusive feedback messages
- **Loading States**: Smooth loading animations and skeletons
- **Error Handling**: Graceful error display and recovery
- **Accessibility**: WCAG 2.1 compliant interface elements
- **Dark Mode Ready**: CSS custom properties for theming

## 🔐 Security Features

### Backend Security
- **Authentication**: JWT-based with refresh token rotation
- **Password Hashing**: bcrypt with configurable salt rounds
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Comprehensive request validation with Joi
- **SQL Injection Protection**: Parameterized queries with Prisma
- **CORS Configuration**: Controlled cross-origin resource sharing
- **Security Headers**: Helmet.js for security headers
- **Environment Variables**: Sensitive data protection

### Frontend Security
- **XSS Protection**: Content sanitization and CSP headers
- **HTTPS Enforcement**: Secure communication requirements
- **Token Management**: Secure storage and automatic refresh
- **Input Sanitization**: Client-side validation and sanitization
- **Content Security**: Image and file upload restrictions

## 🧪 Testing

### Backend Testing
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Frontend Testing
```bash
# Run frontend tests
npm run test

# Run E2E tests
npm run test:e2e
```

## 📊 Performance Optimizations

### Backend Optimizations
- **Database Indexing**: Optimized queries with proper indexes
- **Caching**: Redis caching for frequently accessed data
- **Pagination**: Efficient data loading with cursor-based pagination
- **Image Processing**: Automatic image optimization and resizing
- **Connection Pooling**: Database connection optimization

### Frontend Optimizations
- **Lazy Loading**: Images and components loaded on demand
- **Code Splitting**: JavaScript bundles split by route
- **Minification**: CSS and JavaScript compression
- **CDN Ready**: Static assets optimized for CDN delivery
- **Service Worker**: Offline functionality and caching strategies

## 🚀 Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d

# Scale services
docker-compose up -d --scale backend=3
```

### Manual Deployment
```bash
# Backend deployment
cd ConnectHub-Backend
npm run build
pm2 start ecosystem.config.js

# Frontend deployment
cd ConnectHub-Frontend
npm run build
# Deploy dist/ folder to your web server
```

### Environment Variables for Production
```env
NODE_ENV=production
DATABASE_URL=your_production_database_url
JWT_SECRET=your_production_jwt_secret
SMTP_HOST=your_production_smtp_host
# ... other production configurations
```

## 🔮 Future Enhancements

### Planned Features
- **Video Calling**: Integrated video chat for dating matches
- **Stories**: Instagram-style stories feature
- **Groups**: Community groups and discussions
- **Events**: Event creation and management
- **Marketplace**: Local marketplace integration
- **Live Streaming**: Live video broadcasting
- **Advanced Analytics**: User engagement insights
- **AI Recommendations**: Machine learning-powered suggestions

### Technical Roadmap
- **Mobile Apps**: Native iOS and Android applications
- **WebRTC Integration**: Real-time video and voice calling
- **Microservices**: Service-oriented architecture migration
- **GraphQL API**: Alternative to REST endpoints
- **Real-time Features**: WebSocket integration for live updates
- **Advanced Security**: Two-factor authentication, biometric login
- **Performance**: Edge computing and global CDN
- **Monitoring**: Advanced application monitoring and alerts

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript/JavaScript best practices
- Write comprehensive tests for new features
- Update documentation for any changes
- Follow the existing code style and formatting
- Ensure all tests pass before submitting PR

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Design Inspiration**: Modern social media platforms
- **Icons**: Font Awesome icon library
- **Images**: Unsplash for demo images
- **Community**: Open source contributors and feedback

## 📞 Support

For support, please email support@connecthub.com or join our community Discord server.

## 🔗 Links

- **Live Demo**: [https://demo.connecthub.com](https://demo.connecthub.com)
- **Documentation**: [https://docs.connecthub.com](https://docs.connecthub.com)
- **API Docs**: [https://api.connecthub.com/docs](https://api.connecthub.com/docs)
- **Community**: [https://community.connecthub.com](https://community.connecthub.com)

---

Built with ❤️ by the ConnectHub Team
