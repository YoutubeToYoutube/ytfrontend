import { createContext } from 'react';
import type { AlertType } from '@/components/ui/alert-container';

export interface AlertContextType {
  showAlert: (type: AlertType, title: string, message: string) => void;
}

export const AlertContext = createContext<AlertContextType | undefined>(undefined); 