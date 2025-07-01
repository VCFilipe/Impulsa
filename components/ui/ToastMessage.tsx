import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { ToastType } from '../../contexts/ToastContext'; // Adjust path as needed

interface ToastMessageProps {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
  onDismiss: (id: string) => void;
}

const icons: Record<ToastType, React.ReactElement> = {
  success: <CheckCircle className="text-green-500" size={24} />,
  error: <XCircle className="text-red-500" size={24} />,
  info: <Info className="text-blue-500" size={24} />,
  warning: <AlertTriangle className="text-yellow-500" size={24} />,
};

const borderColors: Record<ToastType, string> = {
  success: 'border-green-500',
  error: 'border-red-500',
  info: 'border-blue-500',
  warning: 'border-yellow-500',
};

const ToastMessage: React.FC<ToastMessageProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onDismiss,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        // Delay dismissal slightly to allow for fade-out animation
        setTimeout(() => onDismiss(id), 300); 
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onDismiss]);

  const handleManualDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss(id), 300); 
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 border-l-4 ${borderColors[type]} flex items-start space-x-3 transition-all duration-300 ease-in-out
                  ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}`}
    >
      <div className="flex-shrink-0 mt-0.5">
        {icons[type]}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{title}</p>
        <p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>
      </div>
      <button
        onClick={handleManualDismiss}
        className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0 ml-2 p-1 -mr-1 -mt-1 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-sky-500"
        aria-label="Fechar notificação"
      >
        <X size={18} />
      </button>
    </div>
  );
};

export default ToastMessage;
