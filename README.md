# MandApp - Mandarin Learning Assistant

MandApp is a modern web application designed to help users learn Mandarin Chinese effectively. Built with Next.js and powered by AI, it provides an interactive platform for vocabulary management and pronunciation practice.

## Features

- **AI-Powered Learning**: Advanced GPT-4o integration for personalized learning assistance
- **Vocabulary Management**: Create, organize, and track your Mandarin vocabulary
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

## Getting Started

### Prerequisites

- Node.js 18 or later
- MongoDB database
- OpenAI API key
- Environment variables set up (see below)

### Installation

1. Clone the repository:
   ```bash
   git clone [your-repo-url]
   cd mandapp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file with:
   ```
   MONGODB_URI=your_mongodb_uri
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   OPENAI_API_KEY=your_openai_api_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

Visit `http://localhost:3000` to see the application.

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

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Troubleshooting

Common issues and solutions:

1. **API Connection Issues**
   - Check your internet connection
   - Verify API keys in environment variables
   - Ensure rate limits haven't been exceeded

2. **Database Connection**
   - Verify MongoDB URI is correct
   - Check database access permissions
   - Ensure MongoDB service is running

3. **Build Errors**
   - Clear `.next` cache directory
   - Update dependencies
   - Check for TypeScript errors

For more help, please open an issue in the repository.
