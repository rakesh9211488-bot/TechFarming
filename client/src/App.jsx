import './App.css';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Shell from './Components/Workspace/Shell';
import Listings from './Components/Workspace/Listings';
import Index from './Pages/Index/Index';
import Login from './Pages/Login/Login';
import SignUp from './Pages/SignUp/SignUp';
import Dashboard from './Pages/Dashboard/Dashboard';
function Project(){return <section className="tf-auth tf-card"><span className="tf-eyebrow">TECHFARMING · PROJECT STATUS</span><h1>From agriculture ideas to working technology.</h1><p>This project combines a React website, Express API, MySQL database and experimental Arduino sensor and rover sketches.</p><h2>Available in this website</h2><p>Account creation, sign-in, session checks, sign-out, sample catalog search, administrator-published jobs, device registration and validated sensor reports.</p><h2>Under development</h2><p>Physical sensor calibration, rover controls, image classification, seller accounts, purchasing and payment processing. These features require implementation and verification before use.</p><a href="https://github.com/rakesh9211488-bot/TechFarming">Read the source and hardware documentation</a></section>;}
function Unavailable(){return <section className="tf-auth tf-card"><h1>This page isn’t available yet.</h1><p>Explore the working project features from the main navigation.</p><Link className="tf-button" to="/">Return home</Link></section>;}
export default function App(){return <BrowserRouter><Shell><Routes><Route path="/" element={<Index/>}/><Route path="/home" element={<Index/>}/><Route path="/login" element={<Login/>}/><Route path="/api/signup/users" element={<SignUp/>}/><Route path="/dashboard" element={<Dashboard/>}/><Route path="/products" element={<Listings/>}/><Route path="/jobs" element={<Listings type="jobs"/>}/><Route path="/about-us" element={<Project/>}/><Route path="*" element={<Unavailable/>}/></Routes></Shell></BrowserRouter>;}
