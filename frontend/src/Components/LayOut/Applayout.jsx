import Sidebar from "../Sidebar/Sidebar";
import StarsBackground from "../ShootingStar/StarBackground";
import { Outlet } from "react-router-dom";
import ThemeToggle from "../common/ThemeToggle";

const AppLayout = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden relative">
      {/* Premium Global Background */}
      <div className="app-bg-container">
        <div className="app-bg-gradient" />
        <div className="floating-mesh" />
        <StarsBackground />
      </div>

      {/* Sidebar - Modern Glassmorphism */}
      <div className="relative z-20 flex-shrink-0 h-full">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 w-full overflow-y-auto overflow-x-hidden max-w-full custom-scrollbar" style={{ minWidth: 0 }}>
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
