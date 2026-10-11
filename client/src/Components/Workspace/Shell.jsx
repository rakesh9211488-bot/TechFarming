import { Link, NavLink } from 'react-router-dom';
import { FaLeaf, FaArrowRight } from 'react-icons/fa';
import './Workspace.css';
export default function Shell({ children }) {
  return <div className="tf-shell">
    <a className="tf-skip" href="#tf-main">Skip to content</a>
    <header className="tf-nav">
      <Link className="tf-brand" to="/"><FaLeaf aria-hidden="true" /> TechFarming<span>Connected agriculture</span></Link>
      <nav aria-label="Main navigation"><NavLink to="/products">Catalog</NavLink><NavLink to="/jobs">Jobs</NavLink><NavLink to="/about-us">Project</NavLink><NavLink className="tf-button tf-small" to="/dashboard">Workspace <FaArrowRight aria-hidden="true" /></NavLink></nav>
    </header>
    <main id="tf-main" className="tf-main">{children}</main>
    <footer className="tf-footer"><span>TechFarming · Maintained by Rakesh Siripaka</span><span>Agriculture technology research project</span><a href="https://github.com/rakesh9211488-bot/TechFarming">View source on GitHub</a></footer>
  </div>;
}
