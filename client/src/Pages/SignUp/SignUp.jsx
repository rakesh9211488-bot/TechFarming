import React, { useState } from 'react'
import { Link } from 'react-router-dom';
import Logo from '../../Assets/Images/Logo.jpg';
import Typewriter from 'typewriter-effect';
import '../../Styles/SignUpForm.css';

import {
  FaArrowRight,
  FaFacebook,
  FaGoogle,
  FaTwitter,
  FaEye,
  FaEyeSlash,
} from 'react-icons/fa';
import SocialMediaAside from '../../Components/SocialMediaAside/SocialMediaAsside';
import Footer1 from '../../Components/Footer/Footer1';

const initialFormData = {
  name: '',
  email: '',
  dob: '',
  gender: '',
  password: '',
  confirmPassword: '',
};

const SignUp = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupError, setSignupError] = useState('');
  const [signupUser, setSignupUser] = useState(null);

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else if (field === 'confirmPassword') {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const isPasswordValid = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (!isPasswordValid(formData.password)) {
      alert(
        'Password must be at least 8 characters long and contain at least one uppercase letter, one digit, and one special character.'
      );
      return;
    }

    try {
      const response = await fetch('/api/users/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Signup successful, you can redirect or show a success message
        setFormData(initialFormData);
        setSignupUser(formData.name);
        console.log('Signup successful');
      } else {
        // Signup failed, handle the error
        const errorData = await response.json();
        setSignupError(errorData.error);
        console.error('Signup failed');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div id='user-sign-up'>
      <div className="outer-container">
        <div className="member-sign-up">
          <div className="logo">
            <img src={Logo} alt="Rakesh-Lungchuingam Company Logo" />
          </div>
          <div className="text-box">
            <div className="typewriter-effect">
              <h1>
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
              </h1>
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
        <div className="container">
          <form onSubmit={handleSubmit}>
            <h2>Sign Up Dear User</h2>
            {signupUser ? (
              <div className="success-message">
                <p>Sign up successful, welcome onboard<br /><span>Dear,{signupUser}</span>!</p>
                <Link to='/dashboard'>Go to Dashboard</Link>
              </div>
            ) : (
              <div className="form-group">
                <div className="form-items">
                  {signupError && <p className="error-message">{signupError}</p>}
                  <div className="form-item">
                    <label htmlFor="full-name">Your Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      autoComplete='on'
                      id='full-name'
                    />
                  </div>
                  <div className="form-item">
                    <label htmlFor="email">Your Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      id='email'
                      autoComplete='on'
                    />
                  </div>
                  <div className="line">
                    <div className="form-item">
                      <label htmlFor="date">Date of Birth</label>
                      <input
                        type="date"
                        name="dob"
                        placeholder='Enter Your Date of Birth'
                        value={formData.dob}
                        onChange={handleChange}
                        autoComplete='on'
                        id='date'
                      />
                    </div>
                    <div className="form-item">
                      <label htmlFor="gender">Gender</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        id='gender'
                      >
                        <option value="select">--Select--</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="line">
                    <div className='form-item'>
                      <label htmlFor='password'>Create a Password</label>
                      <div className='password-input'>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name='password'
                          value={formData.password}
                          onChange={handleChange}
                          id='password'
                        />
                        <button
                          type='button'
                          className='button-password'
                          onClick={() => togglePasswordVisibility('password')}
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>
                    <div className='form-item'>
                      <label htmlFor='confirmPassword'>Confirm Password</label>
                      <div className='password-input'>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name='confirmPassword'
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          id='confirmPassword'
                        />
                        <button
                          type='button'
                          className='button-password'
                          onClick={() => togglePasswordVisibility('confirmPassword')}
                        >
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="navigate">
                    <p>Already have an account <Link to='/login'>Sign in<FaArrowRight /></Link></p>
                  </div>
                  <div className="button">
                    <button type="submit">Sign Up</button>
                  </div>
                </div>
              </div>
            )}
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
                    <span>Sign up with Google</span>
                  </a>
                </li>
                <li>
                  <a href="#twitter">
                    <div className="social-icons-line">
                      <FaTwitter className='icon twitter'></FaTwitter>
                    </div>
                    <span>Sign up with Twitter</span>
                  </a>
                </li>
                <li>
                  <a href="#facebook">
                    <div className="social-icons-line">
                      <FaFacebook className='icon facebook'></FaFacebook>
                    </div>
                    <span>Sign up with Facebook</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Footer1></Footer1>
    </div>
  )
}

export default SignUp