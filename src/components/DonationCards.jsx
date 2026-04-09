import React from 'react';
import '../styles/donationCards.css';

const cards = [
  { title: 'Annadana Seva', label: 'DONATE ₹ 1000', amount: 1 },
  { title: 'Annadana Seva', label: 'DONATE ₹ 1500', amount: 1500 },
  { title: 'Feed 100 People', label: 'DONATE ₹ 2700', amount: 2700 },
  { title: 'Feed 200 People', label: 'DONATE ₹ 5400', amount: 5400 },
  { title: 'Feed 300 People', label: 'DONATE ₹ 8100', amount: 8100 },
  { title: 'Feed 500 People', label: 'DONATE ₹ 13,500', amount: 13500 },
  { title: 'Feed 1,000 People', label: 'DONATE ₹ 27,000', amount: 27000 },
  { title: 'Feed 1,500 People', label: 'DONATE ₹ 40,500', amount: 40500 },

];

export default function DonationCards() {
  const handleDonate = (amount) => {
    // Emit a CustomEvent so DonationSection can listen and open the modal without navigating
    const evt = new CustomEvent('donationPreset', { detail: { amount } });
    window.dispatchEvent(evt);
    // provide visual context by scrolling to donation section
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
