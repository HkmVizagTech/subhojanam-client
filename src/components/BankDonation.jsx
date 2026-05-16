import "../styles/bankdonation.css";

function BankDonation() {
  return (
    <section className="bank-donation-section">
      <div className="bank-donation-box">

        <h2 className="bank-donation-title">Donation Through Bank (NEFT / RTGS)</h2>

        <div className="bank-details-grid">
          <div className="bank-row">
            <span className="bank-label">Beneficiary Name</span>
            <span className="bank-value">HARE KRISHNA MOVEMENT INDIA</span>
          </div>
          <div className="bank-row">
            <span className="bank-label">Bank Name</span>
            <span className="bank-value">IDFC FIRST BANK LTD</span>
          </div>
          <div className="bank-row">
            <span className="bank-label">Account No</span>
            <span className="bank-value">10091415313</span>
          </div>
          <div className="bank-row">
            <span className="bank-label">IFSC Code</span>
            <span className="bank-value">IDFB0080412</span>
          </div>
        </div>

        <div className="bank-note">
          <span className="bank-note-icon">🙏</span>
          <p>
            <strong>Gentle Request!</strong> After transferring, please send us a screenshot along with your
            complete address and PAN details on our WhatsApp{" "}
            <a href="https://wa.me/918977761187" target="_blank" rel="noopener noreferrer">
              +91 89777 61187
            </a>{" "}
            or email us at{" "}
            <a href="mailto:mukunda@hkmvizag.org">mukunda@hkmvizag.org</a>.
            You may also call on the same number for any queries.
          </p>
        </div>

      </div>
    </section>
  );
}

export default BankDonation;
