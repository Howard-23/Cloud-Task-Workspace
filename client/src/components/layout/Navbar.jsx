import { Link, NavLink } from 'react-router-dom';

import Button from '../ui/Button';

export default function Navbar() {
  return (
    <header className="navbar">
      <Link className="brand" to="/">
        <span className="brand__mark">CT</span>
        <span>CloudTask Pro</span>
      </Link>

      <nav className="navbar__links">
        <NavLink to="/features">Features</NavLink>
        <NavLink to="/login">Login</NavLink>
        <Link to="/register">
          <Button size="sm">Start Free</Button>
        </Link>
      </nav>
    </header>
  );
}
