# Debugging Guide

This document provides guidance on debugging the currency dashboard application, using the built-in logging system and debugging tools.

## Logging System

### Setting Log Levels

The application uses a tiered logging system with four levels of verbosity:

1. **DEBUG** - Most verbose, includes all logs (development)
2. **INFO** - Standard operational information (default in production)
3. **WARN** - Warnings and potential issues
4. **ERROR** - Critical errors only

You can set the log level in several ways:

#### 1. Using Environment Files

The easiest way is to use the provided environment configuration files:

```bash
# For local development with DEBUG logs
npm run env:local

# For production with INFO logs
npm run env:prod
```

#### 2. Directly in the .env File

You can modify the .env file directly:

```
LOG_LEVEL=DEBUG  # Most verbose
LOG_LEVEL=INFO   # Standard (default)
LOG_LEVEL=WARN   # Only warnings and errors
LOG_LEVEL=ERROR  # Only errors
```

#### 3. Override for a Single Run

You can override the log level for a single run:

```bash
# Run with DEBUG logs
LOG_LEVEL=DEBUG npm start

# Development mode with DEBUG logs
npm run dev:debug
```

### Log Format

Logs are structured as follows:

```
[Timestamp] [Level] [Context] Message Additional_Data
```

Example:
```
[2023-05-14T12:34:56.789Z] [INFO] [CurrencyService] Getting available currencies
```

## Debugging Tools

### Debug Helper

The application includes a debug helper script to check your environment and API connections:

```bash
npm run debug
```

This will:
1. Display your current environment variables
2. Test the connection to the Exchange Rate API
3. Show sample currency rates

### Checking API Status

You can verify the API is working correctly by running:

```bash
curl https://api.exchangerate-api.com/v4/latest/USD
```

### Common Issues and Solutions

#### 1. API Connection Problems

If you see errors related to the API connection:

- Check your internet connection
- Verify the API is not down
- Run the debug helper to check the API status: `npm run debug`

#### 2. Missing Cache Data

If currencies or rates seem outdated:

- The cache service may be holding old data
- Restart the application to clear the cache
- Check the logs for "Cache hit" vs "Cache miss" messages

#### 3. Validation Issues

If currency codes are being rejected:

- Check that you're using valid 3-letter ISO currency codes
- Look for "Invalid currency code" warnings in the logs
- Make sure the API supports the currency you're trying to use

## Additional Debug Information

### Log File for the Dashboard Route

When you access the dashboard route, the following log entries are created (at DEBUG level):

1. Request log: `GET /dashboard 200 - 123ms`
2. Authentication check
3. Base currency validation
4. Target currencies validation
5. Exchange rate fetching (from cache or API)
6. Currency list fetching (from cache or API)
7. Dashboard rendering

Looking for these entries can help pinpoint where issues occur in the request processing flow.

### Analyzing Multi-Select Issues

If the multi-select dropdown is not working correctly:

1. Check the browser console for any JavaScript errors
2. Verify the POST/GET parameters in the logs
3. Look for "Invalid target currencies provided" warnings 
