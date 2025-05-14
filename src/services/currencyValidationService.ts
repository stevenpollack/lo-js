import { CurrencyService } from './currencyService';
import { DEFAULT_CURRENCIES, DEFAULT_BASE_CURRENCY, DEFAULT_TARGET_CURRENCIES } from '../config/currencies';

/**
 * Service for validating currency codes
 */
export class CurrencyValidationService {
  private static instance: CurrencyValidationService;
  private validCurrencyCodes: Set<string> = new Set(DEFAULT_CURRENCIES);
  private isInitialized: boolean = false;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): CurrencyValidationService {
    if (!CurrencyValidationService.instance) {
      CurrencyValidationService.instance = new CurrencyValidationService();
    }
    return CurrencyValidationService.instance;
  }

  /**
   * Initialize valid currency codes by fetching from API
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      const currencyService = CurrencyService.getInstance();
      const currencies = await currencyService.getAvailableCurrencies();
      
      // Add all currencies from the API and ensure USD is included
      this.validCurrencyCodes = new Set([...currencies, DEFAULT_BASE_CURRENCY]);
      
      console.log(`Initialized ${this.validCurrencyCodes.size} valid currency codes`);
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize currency validation service:', error);
      // Continue using the default currencies
      console.log(`Using ${this.validCurrencyCodes.size} default currency codes`);
      this.isInitialized = true;
    }
  }

  /**
   * Check if a currency code is valid
   */
  public isValid(code: string): boolean {
    // Currency codes must be:
    // 1. Strings
    // 2. 3 uppercase letters
    // 3. In our whitelist
    return typeof code === 'string' && 
           /^[A-Z]{3}$/.test(code) && 
           this.validCurrencyCodes.has(code);
  }

  /**
   * Sanitize and validate a currency code
   * @returns The sanitized currency code if valid, or the default if invalid
   */
  public sanitizeBaseCurrency(code: any): string {
    // Handle null/undefined
    if (code === null || code === undefined) {
      return DEFAULT_BASE_CURRENCY;
    }
    
    // Convert to string, uppercase and trim
    const sanitized = String(code).toUpperCase().trim();
    
    // Return sanitized code if valid, otherwise return default
    return this.isValid(sanitized) ? sanitized : DEFAULT_BASE_CURRENCY;
  }

  /**
   * Sanitize and validate an array of currency codes
   * @returns Array of valid currency codes, or defaults if all invalid
   */
  public sanitizeTargetCurrencies(codes: any): string[] {
    // Handle null/undefined
    if (!codes) {
      return DEFAULT_TARGET_CURRENCIES;
    }
    
    // Convert to array if not already
    const codesArray = Array.isArray(codes) 
      ? codes 
      : typeof codes === 'string' 
        ? codes.split(',') 
        : [codes];
    
    // Sanitize each code and filter invalid ones
    const validCodes = codesArray
      .map(code => String(code).toUpperCase().trim())
      .filter(code => this.isValid(code));
    
    // Return valid codes or defaults if empty
    return validCodes.length > 0 ? validCodes : DEFAULT_TARGET_CURRENCIES;
  }

  /**
   * Get all valid currency codes
   */
  public getValidCurrencies(): string[] {
    return Array.from(this.validCurrencyCodes);
  }
} 
