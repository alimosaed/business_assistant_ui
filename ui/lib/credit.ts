import { apiGet } from './api';

export interface CreditBalance {
  user_id: string;
  credit_balance: number;
}

// Fetch current user's credit balance
export async function fetchCreditBalance(): Promise<CreditBalance | null> {
  try {
    const data = await apiGet<CreditBalance>(
      `${process.env.NEXT_PUBLIC_API_URL}/token-usage/credit/me`,
      { skipAuthRedirect: true }
    );
    return data;
  } catch (error) {
    console.error('Failed to fetch credit balance:', error);
    return null;
  }
}

// Format balance for display
export function formatBalance(balance: number): string {
  return `$${balance.toFixed(2)}`;
}

// Get balance status class for styling
export function getBalanceStatusClass(balance: number): string {
  if (balance <= 0) {
    return 'text-red-600 dark:text-red-400';
  } else if (balance < 1.0) {
    return 'text-yellow-600 dark:text-yellow-400';
  }
  return 'text-green-600 dark:text-green-400';
}