import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type AccountMode = 'client' | 'company';

const MODE_KEY = 'autoclean_active_mode';

interface AccountModeContextValue {
  activeMode: AccountMode;
  isClientMode: boolean;
  isCompanyMode: boolean;
  switchToClientMode: () => void;
  switchToCompanyMode: () => void;
}

const AccountModeContext = createContext<AccountModeContextValue>({
  activeMode: 'client',
  isClientMode: true,
  isCompanyMode: false,
  switchToClientMode: () => {},
  switchToCompanyMode: () => {},
});

export function AccountModeProvider({
  children,
  isCompanyOwner,
}: {
  children: ReactNode;
  isCompanyOwner: boolean;
}) {
  const [activeMode, setActiveModeState] = useState<AccountMode>(() => {
    if (typeof window === 'undefined' || !isCompanyOwner) return 'client';
    const saved = localStorage.getItem(MODE_KEY) as AccountMode | null;
    return saved === 'company' ? 'company' : 'client';
  });

  useEffect(() => {
    if (!isCompanyOwner && activeMode !== 'client') {
      setActiveModeState('client');
      localStorage.setItem(MODE_KEY, 'client');
    }
  }, [isCompanyOwner, activeMode]);

  function switchToClientMode() {
    setActiveModeState('client');
    localStorage.setItem(MODE_KEY, 'client');
  }

  function switchToCompanyMode() {
    if (!isCompanyOwner) return;
    setActiveModeState('company');
    localStorage.setItem(MODE_KEY, 'company');
  }

  const isCompanyMode = activeMode === 'company' && isCompanyOwner;

  return (
    <AccountModeContext.Provider
      value={{
        activeMode,
        isClientMode: !isCompanyMode,
        isCompanyMode,
        switchToClientMode,
        switchToCompanyMode,
      }}
    >
      {children}
    </AccountModeContext.Provider>
  );
}

export function useAccountMode(): AccountModeContextValue {
  return useContext(AccountModeContext);
}
