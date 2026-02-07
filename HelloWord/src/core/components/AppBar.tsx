import React from 'react';
import { useNavigate } from 'react-router-dom';

interface AppBarProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  rightActionLabel?: string;
}

function AppBar({ 
  title, 
  subtitle, 
  showBack = true, 
  onBack, 
  rightAction,
  rightActionLabel 
}: AppBarProps) {
  const navigate = useNavigate();
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="sticky top-0 z-50 flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 border-b border-gray-200 dark:border-gray-800 justify-between">
      {showBack && (
        <button 
          onClick={handleBack}
          className="text-gray-900 dark:text-white flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          aria-label="Go back"
        >
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>
      )}
      
      <div className="flex flex-col items-center flex-1">
        {subtitle && (
          <span className="text-xs font-sans font-medium uppercase tracking-widest text-primary mb-0.5">
            {subtitle}
          </span>
        )}
        <h1 className="text-gray-900 dark:text-white text-lg font-bold leading-tight tracking-tight">
          {title}
        </h1>
      </div>
      
      {rightAction ? (
        <button 
          onClick={() => {}}
          className="text-gray-900 dark:text-white flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          aria-label={rightActionLabel || 'Action'}
        >
          {rightAction}
        </button>
      ) : (
        <button 
          className="flex size-10 items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          aria-label="Settings"
        >
          <span className="material-symbols-outlined text-[#92a4c9]">settings</span>
        </button>
      )}
    </div>
  );
}

export default AppBar;
