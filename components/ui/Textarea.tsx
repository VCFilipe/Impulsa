import React, { forwardRef } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, id, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}
        <textarea
          id={id}
          ref={ref} // Added ref here
          rows={4}
          className={`block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary dark:focus:ring-sky-500 focus:border-primary dark:focus:border-sky-500 sm:text-sm 
                      ${props.disabled 
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                        : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'} 
                      ${error ? 'border-red-500 dark:border-red-400' : ''} ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea'; // Optional: for better debugging

export default Textarea;