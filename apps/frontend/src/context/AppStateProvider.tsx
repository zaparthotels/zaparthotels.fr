import type React from 'react';
import { type ReactNode, createContext, useContext, useState } from 'react';
import { ContrastManager } from '../managers/ContrastManager';
import { FontManager } from '../managers/FontManager';
import { LocaleManager } from '../managers/LocaleManager';
import { ThemeManager } from '../managers/ThemeManager';
import { ErrorView } from '../views/Error/ErrorView';

export interface AppStateContextProps {
  currentView: JSX.Element;
  setCurrentView: (view: JSX.Element) => void;
  themeManager: ThemeManager;
  fontManager: FontManager;
  localeManager: LocaleManager;
  contrastManager: ContrastManager;
}

const AppStateContext = createContext<AppStateContextProps | undefined>(
  undefined,
);

export const AppStateProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentView, setCurrentView] = useState<JSX.Element>(
    <ErrorView message="Cannot load view." />,
  );

  const themeManager = new ThemeManager();
  const fontManager = new FontManager();
  const localeManager = new LocaleManager();
  const contrastManager = new ContrastManager();

  return (
    <AppStateContext.Provider
      value={{
        currentView,
        setCurrentView,
        themeManager,
        fontManager,
        localeManager,
        contrastManager,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAppState = (): AppStateContextProps => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState doit être utilisé dans un AppStateProvider');
  }
  return context;
};
