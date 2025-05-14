# Currency Dashboard

A server-side rendered currency conversion dashboard that uses minimal JavaScript. The application uses TypeScript for the backend and EJS for templating.

## Features

- Server-side rendering with minimal JavaScript
- User authentication
- Real-time currency conversion rates
- URL-based state management
- Responsive design

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following content:
```
PORT=3000
SESSION_SECRET=your-super-secret-key-change-this-in-production
NODE_ENV=development
```

3. Build the TypeScript code:
```bash
npm run build
```

4. Start the development server:
```bash
npm run dev
```

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
