import React, { useEffect } from 'react';
import { CheckCircle2Icon, AlertCircleIcon, InfoIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export type AlertType = 'success' | 'error' | 'info';

interface AlertContainerProps {
  type: AlertType;
  title: string;
  message: string;
  isVisible: boolean;
  onClose: () => void;
  autoHideDuration?: number;
}

export const AlertContainer: React.FC<AlertContainerProps> = ({
  type,
  title,
  message,
  isVisible,
  onClose,
  autoHideDuration = 3000
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, autoHideDuration);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, autoHideDuration]);

  if (!isVisible) return null;

  const variant = type === 'error' ? 'destructive' : 'default';
  
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2Icon className="h-4 w-4" />;
      case 'error':
        return <AlertCircleIcon className="h-4 w-4" />;
      case 'info':
        return <InfoIcon className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md animate-in fade-in slide-in-from-top-2 duration-300">
      <Alert variant={variant}>
        {getIcon()}
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>
          {message}
        </AlertDescription>
      </Alert>
    </div>
  );
}; 