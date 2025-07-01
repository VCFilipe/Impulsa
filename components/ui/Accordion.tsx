

import React, { useState, createContext, useContext, ReactNode, useId, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

// --- AccordionItem ---
interface AccordionItemContextType {
  isOpen: boolean;
  toggleOpen: () => void;
  panelId: string;
  triggerId: string;
}
const AccordionItemContext = createContext<AccordionItemContextType | undefined>(undefined);

const useAccordionItemContext = () => {
  const context = useContext(AccordionItemContext);
  if (!context) {
    throw new Error('AccordionItem sub-components must be used within an AccordionItem');
  }
  return context;
};

interface AccordionItemProps {
  children: ReactNode;
  id: string; // ID for the item, used for defaultOpen management
}

export const AccordionItem: React.FC<AccordionItemProps> = ({ children, id }) => {
  const accordionContext = useAccordionContext();
  const isOpen = accordionContext.openItems.includes(id);
  
  // Generate unique IDs for trigger and panel based on the item's id prop
  const uniqueBaseId = useId(); // Fallback if item id isn't sufficiently unique for DOM, but we use item.id
  const triggerId = `accordion-trigger-${id || uniqueBaseId}`;
  const panelId = `accordion-panel-${id || uniqueBaseId}`;

  const toggleOpen = () => {
    accordionContext.toggleItem(id);
  };

  return (
    <AccordionItemContext.Provider value={{ isOpen, toggleOpen, panelId, triggerId }}>
      <div className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">{children}</div>
    </AccordionItemContext.Provider>
  );
};

// --- AccordionTrigger ---
interface AccordionTriggerProps {
  children: ReactNode;
  className?: string;
}
export const AccordionTrigger: React.FC<AccordionTriggerProps> = ({ children, className }) => {
  const { isOpen, toggleOpen, panelId, triggerId } = useAccordionItemContext();
  return (
    <button
      type="button"
      id={triggerId} // Use the ID passed from AccordionItemContext
      aria-expanded={isOpen}
      aria-controls={panelId}
      onClick={toggleOpen}
      className={`flex items-center justify-between w-full p-3.5 text-left font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-sky-500 transition-colors duration-150 ${className}`}
    >
      <div className="flex-1">{children}</div>
      <ChevronDown
        size={20}
        className={`ml-3 transform transition-transform duration-200 text-gray-500 dark:text-gray-400 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
      />
    </button>
  );
};

// --- AccordionContent ---
interface AccordionContentProps {
  children: ReactNode;
  className?: string;
}
export const AccordionContent: React.FC<AccordionContentProps> = ({ children, className }) => {
  const { isOpen, panelId, triggerId } = useAccordionItemContext(); // Get triggerId from context
  return (
    <div
      id={panelId} // Use the ID passed from AccordionItemContext
      role="region"
      aria-labelledby={triggerId} // Use triggerId from context
      hidden={!isOpen}
      className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isOpen ? 'max-h-[2000px] opacity-100 px-3.5 pb-3.5 pt-2' : 'max-h-0 opacity-0' // Increased max-h
      } ${className}`}
    >
      {children}
    </div>
  );
};


// --- Accordion (Main Component) ---
interface AccordionContextType {
  openItems: string[];
  toggleItem: (itemId: string) => void;
}

const AccordionContext = createContext<AccordionContextType | undefined>(undefined);

const useAccordionContext = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('AccordionItem must be used within an Accordion component');
  }
  return context;
};

interface AccordionProps {
  children: ReactNode;
  allowMultipleOpen?: boolean;
  defaultOpenIds?: string[]; // Array of item IDs to be open by default
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  children,
  allowMultipleOpen = false,
  defaultOpenIds = [],
  className = '',
}) => {
  const [openItems, setOpenItems] = useState<string[]>(defaultOpenIds);

  const toggleItem = (itemId: string) => {
    setOpenItems(prevOpenItems => {
      const isOpen = prevOpenItems.includes(itemId);
      if (allowMultipleOpen) {
        return isOpen ? prevOpenItems.filter(id => id !== itemId) : [...prevOpenItems, itemId];
      } else {
        return isOpen ? [] : [itemId];
      }
    });
  };
  
  // Update openItems if defaultOpenIds prop changes externally
  useEffect(() => {
    setOpenItems(defaultOpenIds);
  }, [defaultOpenIds]);


  return (
    <AccordionContext.Provider value={{ openItems, toggleItem }}>
      <div className={`bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
};