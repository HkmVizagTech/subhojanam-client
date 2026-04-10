import React from 'react';
import '../styles/donationCards.css';

const cards = [
  { title: 'Feed 100 People', label: 'DONATE ₹ 2500', amount: 2500 },
  { title: 'Feed 200 People', label: 'DONATE ₹ 5000', amount: 5000 },
  { title: 'Feed 300 People', label: 'DONATE ₹ 7400', amount: 7500 },
  { title: 'Feed 400 People', label: 'DONATE ₹ 10,000', amount: 10000 },
  { title: 'Feed 500 People', label: 'DONATE ₹ 12,500', amount: 12500 },
  { title: 'Feed 1000 People', label: 'DONATE ₹ 25,000', amount: 25000 },
  { title: 'Feed 1500 People', label: 'DONATE ₹ 37,500', amount: 37500 },
  { title: 'Feed 2000 People', label: 'DONATE ₹ 50,000', amount: 50000 },

];

export default function DonationCards() {
  const handleDonate = (amount) => {
   
    const evt = new CustomEvent('donationPreset', { detail: { amount } });
    window.dispatchEvent(evt);
    
    const el = document.getElementById('donate') || document.getElementById('donation-section');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="donation-cards-section" id="donation-cards">
      <div className="container">
        <h2 className="section-title">Choose a Donation</h2>
        <p className="section-sub">Select a preset donation amount or donate any other amount.</p>
        <div className="cards-grid">
          {cards.map((c, idx) => (
            <div className="donation-card" key={idx}>
              <div className="card-header">
                <h3>{c.title}</h3>
              </div>
              <div className="card-body">
                <div className="amount">{c.amount ? `₹${c.amount.toLocaleString()}` : ''}</div>
                <div className="label">{c.label}</div>
              </div>
              <div className="card-footer">
                <button className="donate-btn" onClick={() => handleDonate(c.amount)}>
                  {c.amount ? `DONATE ₹ ${c.amount.toLocaleString()}` : 'DONATE NOW'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
