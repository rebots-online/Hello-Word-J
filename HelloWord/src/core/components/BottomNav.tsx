import React from 'react';

interface BottomNavProps {
  items: NavItem[];
  onNavigate: (route: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  active: boolean;
}

function BottomNav({ items, onNavigate }: BottomNavProps) {
  const location = window.location as Location;
  
  const handleNavigate = (route: string) => {
    onNavigate(route);
  };

  return (
    <nav className="fixed bottom-0 w-full z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 pb-safe pt-2 pb-5">
      <div className="flex justify-around items-center h-full max-w-lg mx-auto">
        {items.map((item) => {
          const isActive = location.pathname === item.route;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.route)}
              className={`
                flex flex-col items-center justify-center gap-1 w-16 
                ${isActive 
                  ? 'text-primary dark:text-white' 
                  : 'text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-white'
                }
                transition-colors group
              `}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className={`material-symbols-outlined text-[26px] ${isActive ? 'fill-current' : ''}`}>
                {item.icon}
              </span>
              <span className="text-[10px] font-sans font-bold">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
