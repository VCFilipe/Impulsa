import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

const Select: React.FC<SelectProps> = ({ label, id, error, options, className, ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <select
        id={id}
        className={`block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary dark:focus:ring-sky-500 focus:border-primary dark:focus:border-sky-500 sm:text-sm 
                  ${ props.disabled 
                      ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed text-gray-500 dark:text-gray-400' 
                      : 'text-gray-900 dark:text-gray-100'
                  } 
                  ${error ? 'border-red-500 dark:border-red-400' : ''} ${className}`}
        {...props}
      >
        <option value="" disabled={props.value !== ""} className="text-gray-500 dark:text-gray-400">Selecione...</option>
        {options.map(option => (
          <option key={option.value} value={option.value} className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700">
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};

export default Select;