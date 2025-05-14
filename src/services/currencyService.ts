import axios from 'axios';
import { CacheService } from './cacheService';
import { LoggerService } from './loggerService';

interface ExchangeRateResponse {
  rates: Record<string, number>;
  base: string;
  timestamp: number;
}

export class CurrencyService {
  private static instance: CurrencyService;
  private readonly baseUrl = 'https://api.exchangerate-api.com/v4/latest';
  private readonly cacheService: CacheService;
  private logger = LoggerService.getInstance().createChild('CurrencyService');

  private constructor() {
    this.cacheService = CacheService.getInstance();
    this.logger.debug('CurrencyService created');
  }

  public static getInstance(): CurrencyService {
    if (!CurrencyService.instance) {
      CurrencyService.instance = new CurrencyService();
    }
    return CurrencyService.instance;
  }

  private getCacheKey(baseCurrency: string): string {
    return `exchange_rates:${baseCurrency}`;
  }

  public async getRates(baseCurrency: string, targetCurrencies: string[]): Promise<Record<string, number>> {
    this.logger.debug('Getting rates', { baseCurrency, targetCurrencies });
    
    try {
      // Try to get from cache first
      const cacheKey = this.getCacheKey(baseCurrency);
      const cachedData = this.cacheService.get<ExchangeRateResponse>(cacheKey);

      let rates: Record<string, number>;
      if (cachedData) {
        this.logger.debug(`Using cached rates for ${baseCurrency}`);
        rates = cachedData.rates;
      } else {
        this.logger.info(`Fetching fresh rates for ${baseCurrency} from API`);
        // If not in cache, fetch from API
        const response = await axios.get<ExchangeRateResponse>(`${this.baseUrl}/${baseCurrency}`);
        rates = response.data.rates;
        
        // Cache the response
        this.cacheService.set(cacheKey, response.data);
        this.logger.debug(`Cached rates for ${baseCurrency}`);
      }

      // Filter and return only requested currencies
      const filteredRates = targetCurrencies.reduce((acc: Record<string, number>, currency: string) => {
        if (rates[currency] === undefined) {
          this.logger.warn(`Rate for ${currency} not found in response for base ${baseCurrency}`);
        } else {
          acc[currency] = rates[currency];
        }
        return acc;
      }, {});
      
      this.logger.debug(`Returning ${Object.keys(filteredRates).length} rates for ${baseCurrency}`);
      return filteredRates;
    } catch (error) {
      this.logger.error(`Error fetching exchange rates for ${baseCurrency}`, error);
      throw new Error('Failed to fetch exchange rates');
    }
  }

  public async getAvailableCurrencies(): Promise<string[]> {
    this.logger.debug('Getting available currencies');
    
    try {
      const cacheKey = 'available_currencies';
      const cachedCurrencies = this.cacheService.get<string[]>(cacheKey);

      if (cachedCurrencies) {
        this.logger.debug(`Using ${cachedCurrencies.length} cached available currencies`);
        return cachedCurrencies;
      }

      this.logger.info('Fetching available currencies from API');
      const response = await axios.get<ExchangeRateResponse>(`${this.baseUrl}/USD`);
      const currencies = Object.keys(response.data.rates);
      
      // Cache the currencies list
      this.cacheService.set(cacheKey, currencies);
      this.logger.debug(`Cached ${currencies.length} available currencies`);
      
      return currencies;
    } catch (error) {
      this.logger.error('Error fetching available currencies', error);
      throw new Error('Failed to fetch available currencies');
    }
  }
} 
