import { NavLink } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  return (
    <div className="bg-light border-end" style={{ width: '240px', minHeight: 'calc(100vh - 56px)' }}>
      <div className="p-3">
        <ul className="nav nav-pills flex-column mb-auto">
          <li className="nav-item mb-2">
            <NavLink
              to="/"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : 'text-dark'}`}
              end
            >
              <i className="bi bi-speedometer2 me-2"></i>
              Dashboard
            </NavLink>
          </li>
          <li className="nav-item mb-2">
            <NavLink
              to="/leads"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : 'text-dark'}`}
            >
              <i className="bi bi-list-task me-2"></i>
              Leads List
            </NavLink>
          </li>
          
          {(user.role === 'Manager' || user.role === 'Admin') && (
            <li className="nav-item mb-2">
              <NavLink
                to="/leads/new"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : 'text-dark'}`}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Create Lead
              </NavLink>
            </li>
          )}

          {user.role === 'Admin' && (
            <li className="nav-item mb-2">
              <NavLink
                to="/users"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : 'text-dark'}`}
              >
                <i className="bi bi-people me-2"></i>
                Manage Users
              </NavLink>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
