import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useLayout } from "@/contexts/LayoutContext";
import { useAuth } from "@/contexts/AuthContext";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  // Always show Sidebar for all roles, remove hasLayout logic
  return (
    <div className="min-h-screen h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 pl-64 flex flex-col min-h-screen h-screen">
        <Header />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
