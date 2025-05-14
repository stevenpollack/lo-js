import express from 'express';
import session from 'express-session';
import path from 'path';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Types
interface User {
  username: string;
  password: string;
}

// Mock user database (in a real app, use a proper database)
const users: User[] = [
  { username: 'demo', password: 'demo123' }
];

// Routes
app.get('/', (req, res) => {
  if (req.session.user) {
    res.redirect('/dashboard');
  } else {
    res.render('login');
  }
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    req.session.user = { username: user.username };
    res.redirect('/dashboard');
  } else {
    res.render('login', { error: 'Invalid credentials' });
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

app.get('/dashboard', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }

  const baseCurrency = req.query.base || 'USD';
  const targetCurrencies = (req.query.targets || 'EUR,GBP,JPY').toString().split(',');

  try {
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
    const data = await response.json();
    
    const rates = targetCurrencies.reduce((acc: Record<string, number>, currency: string) => {
      acc[currency] = data.rates[currency];
      return acc;
    }, {});

    res.render('dashboard', {
      user: req.session.user,
      baseCurrency,
      rates,
      targetCurrencies
    });
  } catch (error) {
    res.render('dashboard', {
      user: req.session.user,
      error: 'Failed to fetch exchange rates'
    });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 
