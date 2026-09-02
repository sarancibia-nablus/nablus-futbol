import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import BottomNav from './BottomNav';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-16 md:pb-0">
      <Sidebar />
      <div className="md:ml-[240px] transition-all duration-300">
        <Topbar />
        <main className="p-4 md:p-8 max-w-7xl mx-auto min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
};

export default MainLayout;
