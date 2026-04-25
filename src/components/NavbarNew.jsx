import React from 'react';
import { Heart, Award } from 'lucide-react';
import '../styles/navbarNew.css';

export default function NavbarNew() {
  const scrollToDonation = () => {
    const donationSection = document.querySelector('.main-section');
    if (donationSection) donationSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <header className="navbar2">
      <div className="navbar2__container">
        <div className="navbar2__logo">
          <img src={'https://storage.googleapis.com/subhojanam/logo.png'} alt="Hare Krishna Movement Visakhapatnam" width="277" height="150" fetchPriority="high" />
        </div>

        <div className="navbar2__buttons">
          <button className="donate-btn2 navbar2-donate-btn" onClick={scrollToDonation}>
            <Heart className="donate-btn2-icon" />
            Donate Now
          </button>

          <button className="exempt-btn2" onClick={scrollToDonation}>
            <Award className="exempt-btn2-icon" />
            80G Exempt
          </button>
        </div>
      </div>
    </header>
  );
}
