# CryptonBets - Advanced Betting Platform

![CryptonBets Logo](./attached_assets/710e85bee379b9f6ac14003249fb60a7-cryptonbets.png)

CryptonBets is an advanced multilingual betting platform with robust identity verification and transaction management, focusing on secure and user-friendly financial interactions.

## 🌟 Features

- **Secure Authentication System** - JWT-based authentication with enhanced password management
- **Multilingual Support** - Complete localization in Turkish, English, and Georgian
- **Advanced User Management** - User profiles, balance tracking, and activity logs
- **KYC Verification System** - Document upload and verification workflow
- **Real-time Betting** - Live updates via WebSocket integration
- **Transaction Management** - Secure deposit and withdrawal processing
- **Casino and Slot Games** - Integration with multiple game providers
- **Admin Dashboard** - Comprehensive administration panel
- **Mobile-First Design** - Responsive interface for all devices
- **Financial Reports** - Detailed analytics and transaction history

## 🛠️ Technology Stack

### Frontend
- **React.js** - Component-based UI development
- **Tailwind CSS** - Utility-first styling framework
- **Framer Motion** - Animations and transitions
- **React Query** - Data fetching and state management
- **Wouter** - Lightweight routing solution
- **ShadcnUI** - UI component library

### Backend
- **Express.js** - Web application framework
- **Drizzle ORM** - Type-safe database toolkit
- **PostgreSQL** - Data persistence via Neon Database
- **WebSocket** - Real-time communication
- **Passport.js** - Authentication middleware
- **JWT** - Secure token-based authentication

## 📋 Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/cryptonbets.git
cd cryptonbets

# Install dependencies
npm install

# Set up environment variables (see .env.example)

# Start development server
npm run dev

# Build for production
npm run build
npm run start
```

## 📊 Database Setup

The project uses Drizzle ORM with PostgreSQL. To set up the database:

```bash
# Push schema changes to the database
npm run db:push
```

## 🖥️ Project Structure

```
├── client/                 # Frontend application
│   ├── public/             # Static assets
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── contexts/       # React contexts
│       ├── hooks/          # Custom React hooks
│       ├── lib/            # Utility functions
│       ├── pages/          # Page components
│       └── App.tsx         # Main application component
├── server/                 # Backend application
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Database access layer
│   └── db.ts               # Database connection
├── shared/                 # Shared code between frontend and backend
│   └── schema.ts           # Database schema definitions
└── migrations/             # Database migrations
```

## 🚀 Deployment

The application can be deployed to any Node.js hosting platform. Recommended platforms include:
- Replit
- Vercel
- Heroku
- AWS

## 🌐 API Documentation

The API documentation is available at `/api-docs` when running the development server.

## 🔐 Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Role-based access control
- Rate limiting for API endpoints
- Input validation and sanitization
- HTTPS enforcement

## 🌍 Internationalization

The platform supports multiple languages through a custom internationalization system. Currently supported languages:
- Turkish (tr)
- English (en)
- Georgian (ka)

## 🧩 Third-Party Integrations

- **Payment Processors**: Papara, CoinPayments, and more
- **Game Providers**: Slotegrator, Pragmatic Play, and others
- **SMS Verification**: For enhanced security during registration and transactions

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Contact

For any inquiries or support, please contact us at [email@example.com](mailto:email@example.com).