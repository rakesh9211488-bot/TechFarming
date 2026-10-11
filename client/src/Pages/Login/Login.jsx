import React, { useState } from 'react';
import { Link } from 'react-router-dom'
import Logo from '../../Assets/Images/Logo.jpg';
import Typewriter from 'typewriter-effect';
import '../../Styles/SignInForm.css';
import {
  FaArrowRight,
  FaGoogle,
  FaTwitter,
  FaFacebook
} from 'react-icons/fa';
import SocialMediaAside from '../../Components/SocialMediaAside/SocialMediaAsside';
import Footer1 from '../../Components/Footer/Footer1';

const initialFormData = {
  email: '',
  password: '',
};

const Login = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loggedInUser, setLoggedInUser] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setShowForgotPassword(false);
    // Reset the "Forgot Password" link visibility
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Login successful, you can redirect or show a success message
        setFormData(initialFormData);
        setLoggedInUser(formData.email);
        console.log('Login successful');
      } else {
        // Login failed, handle the error
        const errorData = await response.json();
        setLoginError(errorData.error);
        console.error('Login failed');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div id="user-log-in">
      <SocialMediaAside></SocialMediaAside>
      <div className="outer-container">
        <div className="container">
          <form onSubmit={handleSubmit}>
            <h2>Sign In</h2>
            {loggedInUser ? (
              <div className="success-message">
                <p>Login successful, welcome back <br /><span>{loggedInUser}</span>!</p>
                <Link to='/dashboard'>Go to Dashboard</Link>
              </div>
            ) : (
              <div className="form-group">
                <div className="form-items">
                  {loginError && <p className="error-message">{loginError}</p>}
                  <div className="form-item">
                    <label htmlFor="email">Your Email</label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      autoComplete="on"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-item">
                    <label htmlFor="password">Your Password</label>
                    <input
                      type="password"
                      name="password"
                      id="password"
                      autoComplete="on"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="line">
                    <div className="form-item">
                      <label htmlFor="remember-me">Remember Me</label>
                      <input
                        type="checkbox"
                        name="remember-me"
                        id="remember-me"
                      />
                    </div>
                    {showForgotPassword ? (
                      <div className="form-item">
                        <Link to="/forgot-password">Forgot Password?</Link>
                      </div>
                    ) : null}
                  </div>
                  <div className="navigate">
                    <p>Don't have an account yet?<Link to='/api/signup/users'>Sign Up<FaArrowRight /></Link></p>
                  </div>
                  <div className="button">
                    <button type="submit">Login</button>
                  </div>
                </div>
              </div>
            )};
          </form>
          <div className="social-sign-up">
            <p><span></span>or<span></span></p>
            <hr />
            <div className="social-sign-ask">
              <ul className="social-icons">
                <li>
                  <a href="#google">
                    <div className="social-icons-line">
                      <FaGoogle className='icon google'></FaGoogle>
                    </div>
                    <span>Sign in with Google</span>
                  </a>
                </li>
                <li>
                  <a href="#twitter">
                    <div className="social-icons-line">
                      <FaTwitter className='icon twitter'></FaTwitter>
                    </div>
                    <span>Sign in with Twitter</span>
                  </a>
                </li>
                <li>
                  <a href="#facebook">
                    <div className="social-icons-line">
                      <FaFacebook className='icon facebook'></FaFacebook>
                    </div>
                    <span>Sign in with Facebook</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="member-sign-up">
          <div className="logo">
            <img src={Logo} alt="Rakesh-Lungchuingam Company Logo" />
          </div>
          <div className="text-box">
            <div className="typewriter-effect">
              <h3>
                <Typewriter options={{
                  strings: [
                    'A warm welcome to TechFarming',
                    'We are a team of engineering enthusiasts passionate about organic cultivation',
                    'We are a team of dedicated engineers working towards creating technologies for agricultural development',
                    'Discover our innovative solutions for sustainable farming',
                    'Join our community of like-minded farmers and technology enthusiasts',
                    'Our server is a machine learning-powered decision-making hub',
                    'Experience our data-driven e-commerce solution for smarter agricultural practices',
                    'Explore our smart robotics technology revolutionizing agriculture',
                    'Join us in shaping the future of farming with cutting-edge technology',
                  ],
                  autoStart: true,
                  loop: true,
                }}
                />
              </h3>
            </div>
            <p>Ready to elevate your agricultural, marketing and technological development experience?</p>
            <p>
              Explore the future of advanced farming and online marketing with <span className='tech'>Tech</span> <span className='farming'>Farming</span> Membership.
            </p>
            <div className="advantages-of-membership">
              <h3>Why Join TechFarming Membership?</h3>
              <ul>
                <li>
                  <span>Access Exclusive Features:</span>Unlock advanced tools and insights for smarter farming.
                </li>
                <li>
                  <span>Priority Ordering:</span>Get ahead with priority access to new products and offers.
                </li>
                <li>
                  <span>Exclusive Discounts: </span>Enjoy members-only pricing and special promotions.
                </li>
                <li>
                  <span>Community Access:</span>Connect with fellow TechFarmers and share insights.
                </li>
                <li>
                  <span>Personalized Recommendations:</span>Receive tailored product recommendations.
                </li>
              </ul>
            </div>
            <div className="request-to-be-member">
              <h3>
                Join TechFarming Membership Today and Harvest the Benefits!
              </h3>
              <p>
                Become a member today to reap the rewards of modern agriculture. Don't miss out on this opportunity to supercharge your farming journey with TechFarming.
              </p>
              <p>
                Ready to get started? Click the "Join Now" button to become a TechFarming member and embrace a more efficient and prosperous farming future.
              </p>
            </div>
          </div>
          <div className="button">
            <input 
             type="email" 
             id='member-email'
             name='email'
             autoComplete='on'
            />
            <Link to='/api/signup/membership'>Join Now</Link>
          </div>
        </div>
      </div>
      <Footer1></Footer1>
    </div>
  );
};

export default Login;
