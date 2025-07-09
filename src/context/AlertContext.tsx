import React, { useState, type ReactNode } from 'react';
import { AlertContainer } from '@/components/ui/alert-container';
import type { AlertType } from '@/components/ui/alert-container';
import { AlertContext } from './AlertContextValue';

export const AlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [alertData, setAlertData] = useState({
    type: 'info' as AlertType,
    title: '',
    message: '',
  });

  const showAlert = (type: AlertType, title: string, message: string) => {
    setAlertData({ type, title, message });
    setIsVisible(true);
  };

  const hideAlert = () => {
    setIsVisible(false);
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <AlertContainer
        type={alertData.type}
        title={alertData.title}
        message={alertData.message}
        isVisible={isVisible}
        onClose={hideAlert}
      />
    </AlertContext.Provider>
  );
}; 