import { useContext } from 'react';
import { AlertContext, type AlertContextType } from '@/context/AlertContextValue';

export const useAlerts = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
}; 