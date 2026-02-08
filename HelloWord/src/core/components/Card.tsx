import React from 'react';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'elevated' | 'bordered';
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}

function Card({ 
  children, 
  variant = 'default', 
  className = '',
  onClick,
  interactive = false
}: CardProps) {
  const baseClasses = `
    bg-surface-light dark:bg-surface-dark 
    rounded-xl 
    border 
    border-gray-200 dark:border-gray-700
    shadow-lg
    p-4
  `;
  
  const variantClasses = {
    default: '',
    glass: 'glass-panel backdrop-filter blur(12px) border-white/10',
    elevated: 'shadow-xl',
    bordered: 'border-2 border-gray-300 dark:border-gray-600',
  };
  
  const cardClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${interactive ? 'cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all' : ''}
    ${className}
  `;

  return (
    <div 
      className={cardClasses}
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      {children}
    </div>
  );
}

export default Card;
