import { CurrencyService } from './currencyService';
import {
  DEFAULT_CURRENCIES,
  DEFAULT_BASE_CURRENCY,
  DEFAULT_TARGET_CURRENCIES,
} from '../config/currencies';
import { LoggerService } from './loggerService';

/**
 * Service for validating currency codes
 */
export class CurrencyValidationService {
  private static instance: CurrencyValidationService;
  private validCurrencyCodes: Set<string> = new Set(DEFAULT_CURRENCIES);
  private isInitialized: boolean = false;
  private logger =
    LoggerService.getInstance().createChild('CurrencyValidation');

  private constructor() {
    this.logger.debug('CurrencyValidationService created');
  }

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
      this.logger.debug('Already initialized, skipping');
      return;
    }

    try {
      this.logger.info('Fetching available currencies from API');
      const currencyService = CurrencyService.getInstance();
      const currencies = await currencyService.getAvailableCurrencies();

      // Add all currencies from the API and ensure USD is included
      this.validCurrencyCodes = new Set([...currencies, DEFAULT_BASE_CURRENCY]);

      this.logger.info(
        `Initialized ${this.validCurrencyCodes.size} valid currency codes`,
      );
      this.isInitialized = true;
    } catch (error) {
      this.logger.error(
        'Failed to initialize currency validation service',
        error,
      );
      // Continue using the default currencies
      this.logger.info(
        `Using ${this.validCurrencyCodes.size} default currency codes`,
        Array.from(this.validCurrencyCodes),
      );
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
    const isValid =
      typeof code === 'string' &&
      /^[A-Z]{3}$/.test(code) &&
      this.validCurrencyCodes.has(code);

    if (!isValid) {
      this.logger.debug(`Invalid currency code: ${code}`);
    }

    return isValid;
  }

  /**
   * Sanitize and validate a currency code
   * @returns The sanitized currency code if valid, or the default if invalid
   */
  public sanitizeBaseCurrency(code: any): string {
    // Handle null/undefined
    if (code === null || code === undefined) {
      this.logger.debug(
        `No base currency provided, using default: ${DEFAULT_BASE_CURRENCY}`,
      );
      return DEFAULT_BASE_CURRENCY;
    }

    // Convert to string, uppercase and trim
    const sanitized = String(code).toUpperCase().trim();

    // Return sanitized code if valid, otherwise return default
    if (!this.isValid(sanitized)) {
      this.logger.warn(
        `Invalid base currency: ${code}, using default: ${DEFAULT_BASE_CURRENCY}`,
      );
      return DEFAULT_BASE_CURRENCY;
    }

    return sanitized;
  }

  /**
   * Sanitize and validate an array of currency codes
   * @returns Array of valid currency codes, or defaults if all invalid
   */
  public sanitizeTargetCurrencies(codes: any): string[] {
    // Handle null/undefined
    if (!codes) {
      this.logger.debug(
        `No target currencies provided, using defaults: ${DEFAULT_TARGET_CURRENCIES.join(', ')}`,
      );
      return DEFAULT_TARGET_CURRENCIES;
    }

    // Convert to array if not already
    const codesArray = Array.isArray(codes)
      ? codes
      : typeof codes === 'string'
        ? codes.split(',')
        : [codes];

    this.logger.debug(`Validating ${codesArray.length} target currencies`);

    // Sanitize each code and filter invalid ones
    const validCodes = codesArray
      .map((code) => String(code).toUpperCase().trim())
      .filter((code) => this.isValid(code));

    // Log invalid codes
    if (validCodes.length < codesArray.length) {
      const invalidCodes = codesArray
        .map((code) => String(code).toUpperCase().trim())
        .filter((code) => !this.isValid(code));

      this.logger.warn(
        `Filtered out ${invalidCodes.length} invalid currency codes`,
        invalidCodes,
      );
    }

    // Return valid codes or defaults if empty
    if (validCodes.length === 0) {
      this.logger.warn(
        `No valid target currencies found, using defaults: ${DEFAULT_TARGET_CURRENCIES.join(', ')}`,
      );
      return DEFAULT_TARGET_CURRENCIES;
    }

    return validCodes;
  }

  /**
   * Get all valid currency codes
   */
  public getValidCurrencies(): string[] {
    return Array.from(this.validCurrencyCodes);
  }
}
