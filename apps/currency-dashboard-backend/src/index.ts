import express from 'express';
import session from 'express-session';
import path from 'path';
import dotenv from 'dotenv';
import expressLayouts from 'express-ejs-layouts';
import { CurrencyService } from './services/currencyService';
import { CurrencyValidationService } from './services/currencyValidationService';
import { LoggerService, LogLevel } from './services/loggerService';

// Extend Express Session interface
declare module 'express-session' {
  interface SessionData {
    user?: {
      username: string;
    };
  }
}

// Initialize environment variables
dotenv.config();

// Initialize logger
const logger = LoggerService.getInstance();
// Set log level from environment or default to INFO
const envLogLevel =
  process.env.LOG_LEVEL?.toUpperCase() as keyof typeof LogLevel;
if (envLogLevel && LogLevel[envLogLevel] !== undefined) {
  logger.setLogLevel(LogLevel[envLogLevel]);
  logger.info(`Log level set to ${logger.getLogLevel()}`);
} else {
  logger.info(`Using default log level: ${logger.getLogLevel()}`);
}

// App initialization
const app = express();
const port = process.env.PORT || 3000;
const currencyService = CurrencyService.getInstance();
const currencyValidationService = CurrencyValidationService.getInstance();

// Initialize currency validation service
logger.info('Initializing currency validation service...');
currencyValidationService
  .initialize()
  .then(() => {
    logger.info('Currency validation service initialized successfully');
  })
  .catch((err) => {
    logger.error('Failed to initialize currency validation service', err);
  });

// Session configuration
logger.debug('Configuring session middleware');
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' },
  }),
);

// View engine setup
logger.debug('Setting up view engine');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// Fix for expressLayouts type error
app.use(expressLayouts as any);
app.set('layout', 'layout');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

// Middleware
logger.debug('Setting up middleware');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Add request logging middleware
app.use((req, res, next) => {
  const start = Date.now();

  // Log when the request completes
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(
      `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`,
    );
  });

  next();
});

// Types
interface User {
  username: string;
  password: string;
}

// Mock user database (in a real app, use a proper database)
const users: User[] = [{ username: 'demo', password: 'demo123' }];

// Routes
logger.debug('Setting up routes');
app.get('/', (req, res) => {
  if (req.session.user) {
    logger.debug('User already logged in, redirecting to dashboard', {
      username: req.session.user.username,
    });
    res.redirect('/dashboard');
  } else {
    logger.debug('Rendering login page');
    res.render('login');
  }
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  logger.debug('Login attempt', { username });

  const user = users.find(
    (u) => u.username === username && u.password === password,
  );

  if (user) {
    logger.info('User logged in successfully', { username });
    req.session.user = { username: user.username };
    res.redirect('/dashboard');
  } else {
    logger.warn('Failed login attempt', { username });
    res.render('login', { error: 'Invalid credentials' });
  }
});

app.get('/logout', (req, res) => {
  if (req.session.user) {
    logger.info('User logged out', { username: req.session.user.username });
  }

  req.session.destroy(() => {
    res.redirect('/');
  });
});

app.get('/dashboard', async (req, res) => {
  if (!req.session.user) {
    logger.warn('Unauthorized access attempt to dashboard');
    return res.redirect('/');
  }

  const routeLogger = logger.createChild('Dashboard');
  routeLogger.debug('Dashboard access', { user: req.session.user.username });

  try {
    // Sanitize and validate base currency
    const rawBase = req.query.base;
    const baseCurrency =
      currencyValidationService.sanitizeBaseCurrency(rawBase);
    if (rawBase && rawBase !== baseCurrency) {
      routeLogger.warn('Invalid base currency provided', {
        provided: rawBase,
        using: baseCurrency,
      });
    } else {
      routeLogger.debug('Using base currency', { currency: baseCurrency });
    }

    // Sanitize and validate target currencies
    const rawTargets = req.query.targets;
    const targetCurrencies =
      currencyValidationService.sanitizeTargetCurrencies(rawTargets);
    if (
      rawTargets &&
      JSON.stringify(rawTargets) !== JSON.stringify(targetCurrencies)
    ) {
      routeLogger.warn('Some invalid target currencies provided', {
        provided: rawTargets,
        using: targetCurrencies,
      });
    } else {
      routeLogger.debug('Using target currencies', {
        currencies: targetCurrencies,
      });
    }

    // Fetch rates and available currencies
    routeLogger.debug('Fetching exchange rates');
    const rates = await currencyService.getRates(
      baseCurrency,
      targetCurrencies,
    );
    routeLogger.debug('Fetching available currencies');
    const availableCurrencies = await currencyService.getAvailableCurrencies();
    routeLogger.debug('Rendering dashboard');

    res.render('dashboard', {
      user: req.session.user,
      baseCurrency,
      rates,
      targetCurrencies,
      availableCurrencies,
    });
  } catch (error) {
    routeLogger.error('Error processing dashboard request', error);
    res.render('dashboard', {
      user: req.session.user,
      error: 'Failed to fetch exchange rates',
    });
  }
});

// Start server
app.listen(port, () => {
  logger.info(`Server running at http://localhost:${port}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
