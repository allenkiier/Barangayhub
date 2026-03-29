import React, { createContext, useContext } from "react";

interface LayoutContextType {
  hasLayout: boolean;
}

const LayoutContext = createContext<LayoutContextType>({ hasLayout: false });

export function LayoutProvider({ children, hasLayout = true }: { children: React.ReactNode; hasLayout?: boolean }) {
  return (
    <LayoutContext.Provider value={{ hasLayout }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  return useContext(LayoutContext);
}
