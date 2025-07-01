import React, { ElementType, forwardRef, ReactNode, ComponentPropsWithoutRef, ForwardedRef, ComponentRef, ComponentPropsWithRef, ReactElement } from 'react';
import { Loader2 } from 'lucide-react'; // Import Loader2

// 1. Define the core props unique to the Button component.
type ButtonOwnProps = {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'link';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
  className?: string;
  loading?: boolean; // Added loading prop
};

// 2. Define props for the ButtonRenderFunction (internal).
// It uses ComponentPropsWithoutRef because 'ref' is a separate argument in the render function.
export type ButtonInternalProps<C extends ElementType = 'button'> =
  ButtonOwnProps &
  { as?: C } &
  Omit<ComponentPropsWithoutRef<C>, keyof ButtonOwnProps | 'as'>;


// 3. Define the actual render function.
// It's generic over 'C' (the element type).
// The 'props' it receives are ButtonInternalProps<C>.
// The 'ref' it receives is ForwardedRef<React.ElementRef<C>>.
const ButtonRenderFunction = <C extends ElementType = 'button'>(
  props: ButtonInternalProps<C>,
  ref: ForwardedRef<any> // Changed from React.ElementRef<C> to any
) => {
  const {
    as,
    children,
    variant = 'primary',
    size = 'md',
    leftIcon,
    rightIcon,
    className = '',
    loading = false, // Added loading prop with default
    ...restProps // These are the props for the underlying component C
  } = props;

  const Component = as || 'button';

  const baseStyles = 'font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-150 flex items-center justify-center';
  
  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-primary-hover focus:ring-primary dark:bg-sky-600 dark:hover:bg-sky-500 dark:text-white dark:focus:ring-sky-400',
    secondary: 'bg-secondary text-white hover:bg-secondary-hover focus:ring-secondary dark:focus:ring-red-500', 
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 dark:hover:bg-red-500 dark:focus:ring-red-400',
    ghost: 'text-primary dark:text-sky-400 hover:bg-primary/10 dark:hover:bg-sky-400/10 focus:ring-primary dark:focus:ring-sky-500',
    outline: 'border border-primary text-primary dark:border-sky-500 dark:text-sky-400 hover:bg-primary/10 dark:hover:bg-sky-400/10 focus:ring-primary dark:focus:ring-sky-500',
    link: 'text-primary dark:text-sky-400 hover:text-primary/90 dark:hover:text-sky-300 hover:underline focus:ring-primary/50 dark:focus:ring-sky-500/50 p-0',
  };
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  const currentSizeStyles = variant === 'link' && (className?.includes('p-0')) ? '' : sizeStyles[size];

  const componentProps: Record<string, any> = { ...restProps };
  if (Component === 'button' && typeof (restProps as React.ButtonHTMLAttributes<HTMLButtonElement>).type === 'undefined') {
    componentProps.type = 'button';
  }
  if (loading) {
    componentProps.disabled = true;
  }


  return (
    <Component
      ref={ref}
      className={`${baseStyles} ${variantStyles[variant]} ${currentSizeStyles} ${className || ''} ${loading ? 'cursor-not-allowed opacity-75' : ''}`}
      {...componentProps}
    >
      {loading ? <Loader2 size={size === 'sm' ? 16 : (size === 'lg' ? 20 : 18)} className="animate-spin mr-2" /> : leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && !loading && <span className="ml-2">{rightIcon}</span>}
    </Component>
  );
};

// 4. Define the type for the exported component (what consumers use).
// It accepts a 'ref' prop derived from React.ComponentPropsWithRef.
interface FinalButtonComponent {
  <C extends React.ElementType = "button">(
    props: ButtonOwnProps & { as?: C } & Omit<React.ComponentPropsWithRef<C>, keyof ButtonOwnProps | 'as'>
  ): React.ReactElement | null;
  displayName?: string;
}


// 5. Create the component using React.forwardRef.
// Cast the render function to 'any' temporarily if TypeScript struggles with complex generic render functions
// inside forwardRef, then cast the result of forwardRef to the desired final component type.
const Button = React.forwardRef(ButtonRenderFunction as any) as FinalButtonComponent;

Button.displayName = 'Button';

export default Button;