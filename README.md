# MandApp - Mandarin Learning Assistant

MandApp is a modern web application designed to help users learn Mandarin Chinese effectively. Built with Next.js and powered by AI, it provides an interactive platform for vocabulary management and pronunciation practice.

## Features

- **AI-Powered Learning**: Advanced GPT-4o integration for personalized learning assistance
- **Vocabulary Management**: Create, organize, and track your Mandarin vocabularys
- **Text-to-Speech**: Native Mandarin pronunciation for better learning
- **User Authentication**: Secure account system with NextAuth.js
- **Responsive Design**: Beautiful, modern UI that works on all devices
- **Real-time Updates**: Stream processing for immediate feedback
- **Progress Tracking**: Monitor your learning journey

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API routes
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **AI Integration**: OpenAI GPT-4o API

## Project Structure

```
src/
├── app/          # Next.js app router pages and layouts
├── components/   # Reusable UI components
├── data/        # Static data and constants
├── hooks/       # Custom React hooks
├── lib/         # Utility libraries and configurations
├── middleware/  # Request middleware
├── models/      # MongoDB models
├── providers/   # React context providers
├── services/    # External service integrations
└── utils/       # Helper functions
```

## Security Features

- Input sanitization
- Rate limiting
- Secure authentication
- Data encryption
- Error logging and monitoring

## AI Integration Details

The AI component provides:
- Real-time language assistance
- Context-aware responses
- Intelligent error correction
- Progressive content generation
- Conversation history management

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
