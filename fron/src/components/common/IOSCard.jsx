import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

const IOSCard = ({ 
  children, 
  className,
  onClick,
  animate = true,
  ...props 
}) => {
  const baseStyles = 'bg-white rounded-ios shadow-ios overflow-hidden';
  
  const CardComponent = animate ? motion.div : 'div';
  const animationProps = animate ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: 'easeOut' }
  } : {};

  return (
    <CardComponent
      className={twMerge(baseStyles, className)}
      onClick={onClick}
      {...animationProps}
      {...props}
    >
      {children}
    </CardComponent>
  );
};

export default IOSCard; 