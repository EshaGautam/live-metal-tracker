import axios from 'axios';
import { useEffect, useState } from 'react';
import Config from 'react-native-config';
import type { MetalCardProps } from '../component/MetalCard';
import { formatUsd, formatChange, formatChangePercent, formatUpdatedTime } from '../util/format';
const API_KEY = Config.GOLD_API_KEY;
const CURRENCY = 'USD';

export type MetalPriceData = {
  timestamp: number;
  metal: string;
  currency: string;
  exchange: string;
  symbol: string;
  prev_close_price: number;
  open_price: number;
  low_price: number;
  high_price: number;
  open_time: number;
  price: number;
  ch: number;
  chp: number;
  ask: number;
  bid: number;
  price_gram_24k: number;
  price_gram_22k: number;
  price_gram_21k: number;
  price_gram_20k: number;
  price_gram_18k: number;
  price_gram_16k: number;
  price_gram_14k: number;
  price_gram_10k: number;
};

export const METALS_CONFIG = [
  { code: 'XAU', name: 'Gold', symbol: 'AU', accentBg: '#FEF9E7' },
  { code: 'XAG', name: 'Silver', symbol: 'AG', accentBg: '#F1F5F9' },
  { code: 'XPT', name: 'Platinum', symbol: 'PT', accentBg: '#F0F4F8' },
  { code: 'XPD', name: 'Palladium', symbol: 'PD', accentBg: '#EFF6FF' },
] as const;

export type MetalConfig = (typeof METALS_CONFIG)[number];

export type MetalQuote = {
  config: MetalConfig;
  data: MetalPriceData | null;
  error: string | null;
  loading: boolean;
};

type UseFetchMetalPricesResult = {
  quotes: MetalQuote[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  lastUpdated: number | null;
};

function createInitialQuotes(): MetalQuote[] {
  return METALS_CONFIG.map(config => ({
    config,
    data: null,
    error: null,
    loading: true,
  }));
}

async function fetchMetalPriceApi(metal: string): Promise<MetalPriceData> {
  const response = await axios.get<MetalPriceData>(
    `https://www.goldapi.io/api/${metal}/${CURRENCY}`,
    {
      headers: {
        'x-access-token': API_KEY,
      },
    },
  );
  return response.data;
}

function getErrorMessage(err: unknown): string {
  return axios.isAxiosError(err)
    ? String(err.response?.data ?? err.message)
    : 'Failed to fetch metal price';
}

export function useFetchMetalPrices(): UseFetchMetalPricesResult {
  const [quotes, setQuotes] = useState<MetalQuote[]>(createInitialQuotes);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllMetals = () => {
    setLoading(true);
    setError(null);
    setQuotes(createInitialQuotes());

    let pending = METALS_CONFIG.length;

    const onMetalSettled = () => {
      pending -= 1;
      if (pending === 0) {
        setQuotes(current => {
          if (!current.some(quote => quote.data !== null)) {
            setError('Failed to load metal prices');
          }
          return current;
        });
        setLoading(false);
      }
    };

    METALS_CONFIG.forEach(config => {
      fetchMetalPriceApi(config.code)
        .then(data => {
          setQuotes(prev =>
            prev.map(quote =>
              quote.config.code === config.code
                ? { config, data, error: null, loading: false }
                : quote,
            ),
          );
        })
        .catch(err => {
          setQuotes(prev =>
            prev.map(quote =>
              quote.config.code === config.code
                ? {
                    config,
                    data: null,
                    error: getErrorMessage(err),
                    loading: false,
                  }
                : quote,
            ),
          );
        })
        .finally(onMetalSettled);
    });
  };

  useEffect(() => {
    fetchAllMetals();
  }, []);

  const lastUpdated = quotes.reduce<number | null>((latest, quote) => {
    if (!quote.data) {
      return latest;
    }
    if (latest === null || quote.data.timestamp > latest) {
      return quote.data.timestamp;
    }
    return latest;
  }, null);

  return {
    quotes,
    loading,
    error,
    refetch: fetchAllMetals,
    lastUpdated,
  };
}

export function mapMetalToCardProps(
  config: MetalConfig,
  data: MetalPriceData,
): Omit<MetalCardProps, 'selected' | 'onPress'> {
  const isPositive = data.ch >= 0;

  return {
    name: config.name,
    symbol: config.symbol,
    price: formatUsd(data.price),
    change: formatChange(data.ch),
    changePercent: formatChangePercent(data.chp),
    isPositive,
    unit: `per troy oz · 24k ${formatUsd(data.price_gram_24k)}/g`,
    accentBg: config.accentBg,
    exchange: data.exchange,
    details: [
      { label: 'High', value: formatUsd(data.high_price) },
      { label: 'Low', value: formatUsd(data.low_price) },
      { label: 'Bid', value: formatUsd(data.bid) },
      { label: 'Ask', value: formatUsd(data.ask) },
      { label: 'Open', value: formatUsd(data.open_price) },
      { label: 'Prev close', value: formatUsd(data.prev_close_price) },
    ],
  };
}

