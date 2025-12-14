import { toast } from 'sonner';
import { 
  AlertCircle, 
  XCircle, 
  WifiOff, 
  CreditCard, 
  Lock,
  AlertTriangle 
} from 'lucide-react';
import React from 'react';

// Error codes from backend
export enum ErrorCode {
  INSUFFICIENT_CREDIT = 'INSUFFICIENT_CREDIT',
  AUTH_ERROR = 'AUTH_ERROR',
  RATE_LIMIT = 'RATE_LIMIT',
  SERVER_ERROR = 'SERVER_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN = 'UNKNOWN'
}

// Error response interface matching backend format
export interface BackendError {
  type: 'error';
  data: string;
  error_code?: string;
  details?: {
    available?: number;
    user_id?: string;
    [key: string]: any;
  };
}

// Error configuration for UI display
export interface ErrorConfig {
  title: string;
  severity: 'error' | 'warning' | 'info';
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

// Map error codes to configurations
export const ERROR_CONFIGS: Record<ErrorCode, ErrorConfig> = {
  [ErrorCode.INSUFFICIENT_CREDIT]: {
    title: 'Insufficient Credit',
    severity: 'error',
    action: {
      label: 'View Settings',
      onClick: () => {
        // This will be passed from the component
      }
    }
  },
  [ErrorCode.AUTH_ERROR]: {
    title: 'Authentication Failed',
    severity: 'error',
    action: {
      label: 'Login Again',
      href: '/login'
    }
  },
  [ErrorCode.RATE_LIMIT]: {
    title: 'Rate Limit Exceeded',
    severity: 'warning'
  },
  [ErrorCode.SERVER_ERROR]: {
    title: 'Server Error',
    severity: 'error'
  },
  [ErrorCode.NETWORK_ERROR]: {
    title: 'Connection Error',
    severity: 'error'
  },
  [ErrorCode.UNKNOWN]: {
    title: 'Error',
    severity: 'error'
  }
};

// Map error codes to icons
const ERROR_ICONS: Record<ErrorCode, React.ComponentType<any>> = {
  [ErrorCode.INSUFFICIENT_CREDIT]: CreditCard,
  [ErrorCode.AUTH_ERROR]: Lock,
  [ErrorCode.RATE_LIMIT]: AlertTriangle,
  [ErrorCode.SERVER_ERROR]: XCircle,
  [ErrorCode.NETWORK_ERROR]: WifiOff,
  [ErrorCode.UNKNOWN]: AlertCircle
};

// Parse backend error and return error code
export function parseErrorCode(error: BackendError): ErrorCode {
  if (!error.error_code) return ErrorCode.UNKNOWN;
  
  const code = error.error_code.toUpperCase();
  if (code in ErrorCode) {
    return ErrorCode[code as keyof typeof ErrorCode];
  }
  
  return ErrorCode.UNKNOWN;
}

// Show enhanced error toast with icon and action
export function showErrorToast(
  error: BackendError, 
  onOpenSettings?: () => void
) {
  const errorCode = parseErrorCode(error);
  const config = ERROR_CONFIGS[errorCode];
  const Icon = ERROR_ICONS[errorCode];
  
  // Format message based on error type
  let message = error.data;
  
  if (errorCode === ErrorCode.INSUFFICIENT_CREDIT && error.details?.available !== undefined) {
    message = `Your balance is $${error.details.available.toFixed(2)}. Please recharge to continue.`;
  }
  
  // Prepare action
  let action = config.action;
  if (errorCode === ErrorCode.INSUFFICIENT_CREDIT && onOpenSettings) {
    action = {
      label: 'View Settings',
      onClick: onOpenSettings
    };
  }
  
  toast.error(message, {
    description: config.title,
    duration: errorCode === ErrorCode.INSUFFICIENT_CREDIT ? Infinity : 5000,
    icon: React.createElement(Icon, { size: 20 }),
    action: action ? {
      label: action.label,
      onClick: () => {
        if (action.href) {
          window.location.href = action.href;
        } else if (action.onClick) {
          action.onClick();
        }
      }
    } : undefined
  });
}