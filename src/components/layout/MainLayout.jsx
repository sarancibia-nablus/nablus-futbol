import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Sidebar />
      <div className="ml-[240px] transition-all duration-300">
        <Topbar />
        <main className="p-8 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
