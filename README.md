# Full-Stack Web Application

A modern full-stack web application built with Next.js, React, and Python backend services.

## 🚀 Tech Stack

### Frontend
- **Next.js 15.5.4** - React framework with Turbopack
- **React 19.1.0** - UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - UI components (Radix UI)
- **Lucide React** - Icon library
- **Recharts** - Data visualization
- **Motion** - Animations
- **Supabase** - Backend services

### Backend
- **Python** - Backend services
- **Supabase** - Database and authentication

## 📋 Prerequisites

- Node.js (v18 or higher)
- Python 3.x
- Git
- npm or yarn

## 🛠️ Installation

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd final
```

### 2. Install Frontend Dependencies
```bash
npm install
```

### 3. Install Python Dependencies
```bash
cd pyend
pip install -r requirements.txt
cd ..
```

Or use the provided batch file:
```bash
install-deps.bat
```

### 4. Environment Setup
Create a `.env.local` file in the root directory with your environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
# Add other environment variables as needed
```

## 🚀 Running the Application

### Development Mode

#### Frontend Only
```bash
npm run dev
```

#### Full Application (Frontend + Backend)
```bash
start-full-app.bat
```

The application will be available at:
- Frontend: `http://localhost:3000`
- Backend: Check the backend configuration for port

### Production Build
```bash
npm run build
npm start
```

## 📁 Project Structure

```
final/
├── app/                    # Next.js app directory
├── components/             # React components
├── src/                    # Source files
├── pages/                  # Next.js pages
├── backend/                # Python backend services
├── pyend/                  # Python endpoints
├── public/                 # Static assets
├── lib/                    # Utility libraries
├── hooks/                  # Custom React hooks
├── integrations/           # Third-party integrations
├── mail/                   # Email templates/services
└── supabase/              # Supabase configuration

```

## 🔧 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is private and proprietary.

## 🔒 Security

- Never commit `.env` files or sensitive credentials
- Keep dependencies up to date
- Follow security best practices

## 📧 Contact

For questions or support, please open an issue in the repository.
