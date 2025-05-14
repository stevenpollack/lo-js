import axios from 'axios';
import { CacheService } from './cacheService';

interface ExchangeRateResponse {
  rates: Record<string, number>;
  base: string;
  timestamp: number;
}

export class CurrencyService {
  private static instance: CurrencyService;
  private readonly baseUrl = 'https://api.exchangerate-api.com/v4/latest';
  private readonly cacheService: CacheService;

  private constructor() {
    this.cacheService = CacheService.getInstance();
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
    try {
      // Try to get from cache first
      const cacheKey = this.getCacheKey(baseCurrency);
      const cachedData = this.cacheService.get<ExchangeRateResponse>(cacheKey);

      let rates: Record<string, number>;
      if (cachedData) {
        rates = cachedData.rates;
      } else {
        // If not in cache, fetch from API
        const response = await axios.get<ExchangeRateResponse>(`${this.baseUrl}/${baseCurrency}`);
        rates = response.data.rates;
        
        // Cache the response
        this.cacheService.set(cacheKey, response.data);
      }

      // Filter and return only requested currencies
      return targetCurrencies.reduce((acc: Record<string, number>, currency: string) => {
        acc[currency] = rates[currency];
        return acc;
      }, {});
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      throw new Error('Failed to fetch exchange rates');
    }
  }

  public async getAvailableCurrencies(): Promise<string[]> {
    try {
      const cacheKey = 'available_currencies';
      const cachedCurrencies = this.cacheService.get<string[]>(cacheKey);

      if (cachedCurrencies) {
        return cachedCurrencies;
      }

      const response = await axios.get<ExchangeRateResponse>(`${this.baseUrl}/USD`);
      const currencies = Object.keys(response.data.rates);
      
      // Cache the currencies list
      this.cacheService.set(cacheKey, currencies);
      
      return currencies;
    } catch (error) {
      console.error('Error fetching available currencies:', error);
      throw new Error('Failed to fetch available currencies');
    }
  }
} 
