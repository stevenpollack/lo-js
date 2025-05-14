# Currency Dashboard

A server-side rendered currency conversion dashboard that uses minimal JavaScript. The application uses TypeScript for the backend and EJS for templating.

## Features

- Server-side rendering with minimal JavaScript
- User authentication
- Real-time currency conversion rates
- URL-based state management
- Responsive design
- Comprehensive logging system
- Currency code validation and security

## Setup

1. Install dependencies:
```bash
npm install
```

2. Use the provided local environment file:
```bash
# Copy the local environment file
cp local.env .env
# Or modify it directly for your needs
```

3. Build the TypeScript code:
```bash
npm run build
```

4. Start the development server:
```bash
npm run dev
```

## Environment Variables

The application uses the following environment variables that can be set in the `.env` file:

- `PORT`: The port number the server will listen on (default: 3000)
- `NODE_ENV`: The environment mode (development, production, test)
- `SESSION_SECRET`: Secret key for session encryption
- `LOG_LEVEL`: Controls the verbosity of the logging system (DEBUG, INFO, WARN, ERROR)

## Logging System

The application includes a comprehensive logging system that helps with debugging and monitoring:

- **Log Levels:** You can set the log level by setting the `LOG_LEVEL` environment variable to:
  - `DEBUG`: Highly detailed logs for troubleshooting (default in development)
  - `INFO`: Standard operational information (default in production)
  - `WARN`: Warnings that don't affect normal operation but might indicate issues
  - `ERROR`: Critical issues that affect application behavior

- **Contextual Logging:** Each component uses its own context to make logs more organized and easier to filter.

- **Request Logging:** All HTTP requests are logged with method, URL, status code, and response time.

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Login with the demo credentials:
   - Username: demo
   - Password: demo123
3. On the dashboard, you can:
   - Select a base currency
   - Enter target currencies (comma-separated)
   - View real-time conversion rates

## Technical Details

- The application uses Express.js with TypeScript
- EJS is used for server-side templating
- Currency rates are fetched from the Exchange Rate API
- Session management is handled by express-session
- All state (except sensitive data) is stored in the URL
- The UI is built with pure HTML and CSS
- Caching is used to improve performance and reduce API calls
- Server-side validation prevents invalid or malicious input
