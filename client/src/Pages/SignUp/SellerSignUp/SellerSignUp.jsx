import React, { useState } from 'react'
import 'animate.css';
import { Link } from 'react-router-dom';
import '../../../Styles/SellerSignup.css'
import AddSocialAccount from './AddSocialAccount';
import { FaArrowRight } from 'react-icons/fa';
import Logo from '../../../Components/FormLogo/Logo';
import Footer1 from '../../../Components/Footer/Footer1';
import SocialMediaAside from '../../../Components/SocialMediaAside/SocialMediaAsside';

const initialFormData = {
  companyID: '',
  name: '',
  companyName: '',
  logo: '',
  website: '',
  productCategory: '',
  phoneNumber: '',
  email: '',
  address: '',
};


const SellerSignUp = () => {
  const [signupSeller, setSignupSeller] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [signupError, setSignupError] = useState('');

  const ProductsCategories = ['Pesticides', 'Organics Vegetables', 'Advanced Robot', 'Irrigation System', 'Chemicals', 'Hydroponics', 'Organics Manure', 'Composed Products']; 
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/sellers/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Signup successful, you can redirect or show a success message
        const responseData = await response.json();
        setFormData(initialFormData);
        setSignupSeller(formData.name);
        console.log('Signup successful');
        alert('Signup successful! Your Company ID is: ' + responseData.companyID);
      } else {
        // Signup failed, handle the error
        const errorData = await response.json();
        setSignupError(errorData.error);
        console.error('Signup failed:', errorData);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSocialAccountAdded = (socialMediaData) => {
    setFormData({ ...formData, socialMedia: socialMediaData });
  };

  const AddressMapLink = ({ address }) => {
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

    return (
      <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
        Mark it on Google Maps
      </a>
    );
  };

  return (
    <div id='seller-sign-up'>
      <SocialMediaAside></SocialMediaAside>
      <div className="outer-container">
        <div className="container">
          <div className="intro">
            <h2><Logo/><span>seller central</span></h2>
          </div>
          <form onSubmit={handleSubmit}>
            <h2>Sign Up Dear Seller</h2>
            {signupSeller ? (
              <div className="success-message">
                <p>Sign up successful, welcome onboard Dear<br /><span>Dear, {signupSeller}</span>!</p>
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
                      title='enter the full name of the CEO of the company'
                    />
                  </div>
                  <div className="form-item">
                    <label htmlFor="company-name">Company/Business Name</label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      autoComplete='on'
                      id='company-name'
                      title='enter the name of the company'
                    />
                  </div>
                  <div className="line">
                    <div className="form-item">
                      <label htmlFor="productCategory">Product Category</label>
                      <input
                        type="text"
                        name="productCategory"
                        value={formData.productCategory} 
                        autoComplete='on'
                        id='productCategory'
                        onChange={handleChange}
                        list="productsCategories"
                      />
                      <datalist id="productsCategories">
                        {ProductsCategories.map((productsCategory, index) => (
                          <option key={index} value={productsCategory} />
                        ))}
                      </datalist>
                    </div>
                    <div className="form-item">
                      <label htmlFor="companyID">CompanyID</label>
                      <input
                        type="text"
                        name="companyID"
                        value={formData.companyID}
                        autoComplete='on'
                        id='companyID'
                        onChange={handleChange}
                        title='Enter any for now, we will generate a new company ID after you sign up'
                      />
                    </div>
                  </div>
                  <div className="line">
                    <div className="form-item">
                      <label htmlFor="email">Your Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        id='email'
                        autoComplete='on'
                        title='enter the email of the new company'
                      />
                    </div>
                    <div className="form-item">
                      <label htmlFor="phone-number">Phone Number</label>
                      <input
                        type="text"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        id='phone-number'
                        autoComplete='on'
                        pattern="\d{10}"
                        inputMode="numeric"
                        title="Please enter exactly 10 digits."
                      />
                    </div>
                  </div>
                  <div className="line">
                    <div className="form-item">
                      <label htmlFor="logo">Company Logo</label>
                      <input
                        type="file"
                        name="logo"
                        value={formData.logo}
                        onChange={handleChange}
                        id='logo'
                        autoComplete='on'
                      />
                    </div>
                    <div className="form-item">
                      <label htmlFor="website">Website</label>
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        id='website'
                        autoComplete='on'
                        title='enter the website URL of the new company'
                      />
                    </div>
                  </div>
                  <div className="form-item">
                    <p>Add social accounts, if you like to do social marketing?</p>
                    <AddSocialAccount onSocialAccountAdded={handleSocialAccountAdded} />
                  </div>
                  <div className="form-item">
                    <label htmlFor="address">Address</label>
                    <input
                      name="address"
                      id="address"
                      type='text'
                      value={formData.address}
                      onChange={handleChange}
                      autoComplete='on'
                      title='enter the address of the company'
                    />
                    <AddressMapLink address={formData.address} />
                  </div>
                  <div className="button">
                    <button type="submit">Sign Up</button>
                  </div>
                  <div className="agreement">
                    <p>By creating an account, you agree to TechFarming's <Link to=''>Conditions of Use</Link><br /> and <Link to='/privacy-policy'>Privacy Notice</Link>.</p>
                  </div>
                </div>
              </div>
            )}
            <hr/>
            <p>Already have an account? &nbsp;
              <Link to='/api/login/sellers'>Next <FaArrowRight/></Link>
            </p>
          </form>
        </div>
      </div>
      <footer>
        <Footer1></Footer1>
      </footer>
    </div>
  )
}

export default SellerSignUp