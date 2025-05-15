#!/usr/bin/env node

/**
 * Debug Helper Script
 * 
 * This script helps with debugging by fetching and displaying information
 * about the currency service, available currencies, and cache status.
 * 
 * Usage:
 *   node scripts/debug-helper.js
 */

// Import required modules
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Configuration
const API_URL = 'https://api.exchangerate-api.com/v4/latest/USD';

// Output styles
const styles = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  fg: {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
  },
  
  bg: {
    black: '\x1b[40m',
    red: '\x1b[41m',
    green: '\x1b[42m',
    yellow: '\x1b[43m',
    blue: '\x1b[44m',
    magenta: '\x1b[45m',
    cyan: '\x1b[46m',
    white: '\x1b[47m',
  }
};

// Helper functions
function printHeader(text) {
  console.log('\n' + styles.bright + styles.fg.cyan + '===== ' + text + ' =====' + styles.reset);
}

function printError(text) {
  console.error(styles.fg.red + text + styles.reset);
}

function printSuccess(text) {
  console.log(styles.fg.green + text + styles.reset);
}

function printInfo(label, value) {
  console.log(styles.bright + label + ': ' + styles.reset + value);
}

async function getExchangeRates() {
  printHeader('Exchange Rate API Check');
  
  try {
    printInfo('API URL', API_URL);
    const response = await axios.get(API_URL);
    printSuccess('API connection successful!');
    
    printInfo('Base currency', response.data.base);
    printInfo('Timestamp', new Date(response.data.timestamp * 1000).toISOString());
    printInfo('Total currencies', Object.keys(response.data.rates).length);
    
    // Display a sample of the rates
    printHeader('Sample Exchange Rates');
    const rates = response.data.rates;
    const sampleCurrencies = ['EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CNY'];
    
    sampleCurrencies.forEach(currency => {
      if (rates[currency]) {
        printInfo(currency, rates[currency]);
      }
    });
    
    return response.data;
  } catch (error) {
    printError('API connection failed!');
    if (error.response) {
      printError(`Status: ${error.response.status}`);
      printError(`Data: ${JSON.stringify(error.response.data)}`);
    } else {
      printError(error.message);
    }
    return null;
  }
}

async function checkEnvironment() {
  printHeader('Environment Variables');
  
  printInfo('NODE_ENV', process.env.NODE_ENV || 'not set');
  printInfo('PORT', process.env.PORT || '3000 (default)');
  printInfo('LOG_LEVEL', process.env.LOG_LEVEL || 'not set (defaults to INFO)');
  
  // Check for other important environment variables
  if (!process.env.SESSION_SECRET) {
    printError('Warning: SESSION_SECRET is not set!');
  } else {
    printSuccess('SESSION_SECRET is set');
  }
}

// Main function
async function main() {
  console.log(styles.bright + styles.fg.yellow + 
    '\n======================================' +
    '\n Currency Dashboard Debug Helper' +
    '\n======================================' + 
    styles.reset);
  
  await checkEnvironment();
  await getExchangeRates();
  
  printHeader('Debug Helper Complete');
}

// Run the script
main().catch(error => {
  printError('Unexpected error:');
  console.error(error);
}); 
