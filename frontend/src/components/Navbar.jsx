import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="navbar navbar-expand-lg px-4 shadow-sm">
      <div className="container-fluid">
        <span className="navbar-brand fw-bold text-primary">LeadManager</span>
        
        <div className="d-flex align-items-center ms-auto">
          {user && (
            <div className="d-flex align-items-center me-3">
              <span className="me-2 fw-semibold">{user.name}</span>
              <span className="badge bg-secondary">{user.role}</span>
            </div>
          )}
          <button className="btn btn-outline-danger btn-sm" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
