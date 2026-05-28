import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Link2, LayoutDashboard, LogOut, Menu, X } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/dashboard" className="navbar-brand">
          <Link2 size={22} />
          <span>
            Snip<em>ly</em>
          </span>
        </Link>

        <div className={`navbar-links ${menuOpen ? "open" : ""}`}>
          <Link
            to="/dashboard"
            className={`nav-link ${isActive("/dashboard") ? "active" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            <LayoutDashboard size={16} />
            Dashboard
          </Link>

          <div className="nav-divider" />

          <div className="nav-user">
            <div className="nav-avatar">{user?.name?.[0]?.toUpperCase()}</div>
            <span className="nav-name">{user?.name}</span>
          </div>

          <button className="btn-logout" onClick={handleLogout}>
            <LogOut size={16} />
            Logout
          </button>
        </div>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
