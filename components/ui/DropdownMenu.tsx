import React, { useState, useEffect, useRef, Fragment } from 'react';
import { MoreVertical } from 'lucide-react';
import Button from './Button';

export interface DropdownMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  isDanger?: boolean; // For styling, e.g., red text for delete
}

interface DropdownMenuProps {
  trigger?: React.ReactElement;
  items: DropdownMenuItem[];
  menuAlign?: 'left' | 'right';
  ariaLabel?: string;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  trigger,
  items,
  menuAlign = 'right',
  ariaLabel = 'Opções'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const toggleMenu = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (isOpen && event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen]);

  const handleItemClick = (itemClickCallback: () => void) => {
    itemClickCallback();
    setIsOpen(false);
  };
  
  const defaultTrigger = (
    <Button
      ref={triggerRef}
      variant="ghost"
      size="sm"
      onClick={toggleMenu}
      aria-haspopup="true"
      aria-expanded={isOpen}
      aria-label={ariaLabel}
      className="p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
    >
      <MoreVertical size={18} />
    </Button>
  );

  return (
    <div className="relative inline-block text-left">
      {React.cloneElement(trigger || defaultTrigger, {
        ref: triggerRef,
        onClick: toggleMenu,
        'aria-haspopup': 'true',
        'aria-expanded': isOpen,
      })}

      {isOpen && (
        <div
          ref={menuRef}
          className={`origin-top-${menuAlign} absolute ${menuAlign}-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black dark:ring-gray-700 ring-opacity-5 focus:outline-none z-30`}
          role="menu"
          aria-orientation="vertical"
          aria-labelledby={triggerRef.current?.id || undefined}
        >
          <div className="py-1" role="none">
            {items.map((item, index) => (
              <Fragment key={item.id}>
                {item.label === '---' ? ( // Custom separator
                  <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                ) : (
                  <button
                    onClick={() => handleItemClick(item.onClick)}
                    disabled={item.disabled}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center transition-colors duration-150 
                      ${item.isDanger 
                        ? 'text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/20 hover:text-red-900 dark:hover:text-red-300' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'}
                      ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    role="menuitem"
                    tabIndex={-1} // Let arrow keys handle focus once menu is open
                    id={`menu-item-${index}`}
                  >
                    {item.icon && <span className="mr-2">{item.icon}</span>}
                    {item.label}
                  </button>
                )}
              </Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;