import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        {/* Logo */}
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <span className="brand-icon">◈</span>
          <span className="brand-name">PLANOVA</span>
        </Link>

        {/* Desktop Nav */}
        <div className="navbar-links">
          <NavLink to="/"        className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'} end>Home</NavLink>
          <NavLink to="/explore" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Explore</NavLink>
          {user && (
            <NavLink to="/my-tickets" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>My Tickets</NavLink>
          )}
          {user?.role === 'admin' && (
            <NavLink to="/admin" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Admin</NavLink>
          )}
        </div>

        {/* Auth Buttons */}
        <div className="navbar-auth">
          {user ? (
            <div className="user-menu">
              <span className="user-avatar">{user.name.charAt(0).toUpperCase()}</span>
              <span className="user-name">{user.name.split(' ')[0]}</span>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <>
              <Link to="/login"    className="btn btn-ghost btn-sm">Log In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
        </div>

        {/* Hamburger */}
        <button
          className={`hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle menu"
        >
          <span/><span/><span/>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <NavLink to="/"           onClick={closeMenu}>Home</NavLink>
          <NavLink to="/explore"    onClick={closeMenu}>Explore Events</NavLink>
          {user && <NavLink to="/my-tickets" onClick={closeMenu}>My Tickets</NavLink>}
          {user?.role === 'admin' && <NavLink to="/admin" onClick={closeMenu}>Admin Dashboard</NavLink>}
          <div className="mobile-auth">
            {user ? (
              <button className="btn btn-outline" onClick={handleLogout}>Logout</button>
            ) : (
              <>
                <Link to="/login"    className="btn btn-ghost" onClick={closeMenu}>Log In</Link>
                <Link to="/register" className="btn btn-primary" onClick={closeMenu}>Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
