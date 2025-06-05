import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

const IOSButton = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className,
  onClick,
  disabled = false,
  loading = false,
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-ios';
  
  const variants = {
    primary: 'bg-ios-blue text-white hover:bg-opacity-90 active:bg-opacity-80',
    secondary: 'bg-ios-gray-200 text-ios-gray-900 hover:bg-ios-gray-300 active:bg-ios-gray-400',
    destructive: 'bg-ios-red text-white hover:bg-opacity-90 active:bg-opacity-80',
    success: 'bg-ios-green text-white hover:bg-opacity-90 active:bg-opacity-80',
    ghost: 'bg-transparent text-ios-blue hover:bg-ios-gray-100 active:bg-ios-gray-200',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={twMerge(
        baseStyles,
        variants[variant],
        sizes[size],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-5 h-5 border-2 border-current border-t-transparent rounded-full mr-2"
        />
      ) : null}
      {children}
    </motion.button>
  );
};

export default IOSButton; 