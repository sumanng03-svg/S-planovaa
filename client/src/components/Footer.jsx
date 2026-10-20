import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <span className="brand-icon">◈</span>
          <span className="brand-name-footer">PLANOVA</span>
          <p className="footer-tagline">Plan less. Experience more.</p>
        </div>

        <div className="footer-links">
          <div className="footer-col">
            <h4>Discover</h4>
            <Link to="/explore">All Events</Link>
            <Link to="/explore?category=Music">Music</Link>
            <Link to="/explore?category=Technology">Technology</Link>
            <Link to="/explore?category=Workshops">Workshops</Link>
          </div>
          <div className="footer-col">
            <h4>Account</h4>
            <Link to="/register">Sign Up</Link>
            <Link to="/login">Log In</Link>
            <Link to="/my-tickets">My Tickets</Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom container">
        <p>© {new Date().getFullYear()} PLANOVA. All rights reserved.</p>
      </div>
    </footer>
  );
}
