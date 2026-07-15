import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const MainLayout = () => {
  return (
    <div className="d-flex flex-column vh-100">
      <Navbar />
      <div className="d-flex flex-grow-1 overflow-hidden">
        <Sidebar />
        <div className="flex-grow-1 p-4 overflow-auto bg-light-subtle">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
