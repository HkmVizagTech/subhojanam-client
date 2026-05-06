
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, FileText, Check } from "lucide-react";
import "../styles/donation.css";
import { fbEvent } from "../lib/fbPixel";
import { getMetaBrowserIds } from "../utils/tracking.js";

function DonationSection() {

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const utmData = {
      source: params.get("utm_source"),
      medium: params.get("utm_medium"),
      campaign: params.get("utm_campaign"),
      content: params.get("utm_content"),
      term: params.get("utm_term")
    };
    
    if (Object.values(utmData).some(Boolean)) {
      localStorage.setItem("utm", JSON.stringify(utmData));
    }
    
    const amountParam = params.get('amount');
    if (amountParam && !isNaN(Number(amountParam))) {
      
      setSelectedAmount(null);
      setCustomAmount(String(Number(amountParam)));
      setShowForm(true);
    
      try {
        const cleanUrl = window.location.pathname + window.location.hash;
        window.history.replaceState(null, '', cleanUrl);
      } catch (e) {
       
      }
    }

    
    const onDonationPreset = (e) => {
      const amt = e && e.detail && e.detail.amount;
      if (amt && !isNaN(Number(amt))) {
        setSelectedAmount(null);
        setCustomAmount(String(Number(amt)));
        setShowForm(true);
      } else {
       
        setSelectedAmount(null);
        setCustomAmount('');
        setShowForm(true);
      }
    };
    window.addEventListener('donationPreset', onDonationPreset);

    return () => {
      window.removeEventListener('donationPreset', onDonationPreset);
    };
  }, []);

  const [type, setType] = useState("one");
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [minAmountLoading, setMinAmountLoading] = useState(false);
  const [minAmountTried, setMinAmountTried] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    occasion: "",
    sevaDate: "",
    dob: "",
    certificate: false,
    mahaprasadam: false,
    prasadamAddressOption: "same",
    prasadamAddress: "",
    panNumber: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    updates: true
  });

  const donationOptions = [
    { amount: 251, meals: 10 },
    { amount: 500, meals: 20 },
    { amount: 1000, meals: 40, popular: true },
    { amount: 2500, meals: 100 }
  ];

  const monthlyDonationOptions = [
    { amount: 500, meals: 20 },
    { amount: 1000, meals: 40 },
    { amount: 1500, meals: 60 },
    { amount: 2000, meals: 80 },
    { amount: 2500, meals: 100 },
    { amount: 3000, meals: 120 }
  ];

  const navigate = useNavigate();

  const handleSelect = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount(amount.toString());
  };

  const handleCustomChange = (e) => {
    let value = e.target.value;
    setCustomAmount(value);
    setSelectedAmount(null);
    setMinAmountTried(false);
  };

  const isCustomAmountInvalid = customAmount !== "" && Number(customAmount) < 25;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
  
    if (e.target.style.border) {
      e.target.style.border = '';
    }
    
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleTypeChange = (newType) => {
    setType(newType);
    setSelectedAmount(null);
    setCustomAmount("");
  };

  const finalAmount = selectedAmount || Number(customAmount);
  const meals = finalAmount ? Math.floor(finalAmount / 25) : 0;

  // Load Razorpay script lazily only when needed
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setErrorMessage("");
    
  
    document.querySelectorAll('.form-field').forEach(field => {
      field.style.border = '';
    });

    if (!formData.name || !formData.mobile) {
      setErrorMessage("Please fill all required fields (Name, Mobile)");
      
    
      if (!formData.name) {
        const field = document.querySelector('input[name="name"]');
        if (field) {
          field.style.border = '2px solid #ff4444';
          field.scrollIntoView({ behavior: 'smooth', block: 'center' });
          field.focus();
        }
      } else if (!formData.mobile) {
        const field = document.querySelector('input[name="mobile"]');
        if (field) {
          field.style.border = '2px solid #ff4444';
          field.scrollIntoView({ behavior: 'smooth', block: 'center' });
          field.focus();
        }
      }
      return;
    }

 
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(formData.mobile)) {
      setErrorMessage("Please enter a valid 10-digit mobile number");
      const field = document.querySelector('input[name="mobile"]');
      if (field) {
        field.style.border = '2px solid #ff4444';
        field.scrollIntoView({ behavior: 'smooth', block: 'center' });
        field.focus();
      }
      return;
    }


    if (formData.email && formData.email.trim() !== '') {
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(formData.email)) {
        setErrorMessage("Please enter a valid email address (e.g., example@gmail.com)");
        const field = document.querySelector('input[name="email"]');
        if (field) {
          field.style.border = '2px solid #ff4444';
          field.scrollIntoView({ behavior: 'smooth', block: 'center' });
          field.focus();
        }
        return;
      }
    }


    if (formData.certificate) {
      if (!formData.panNumber || !formData.address || !formData.city || !formData.state || !formData.pincode) {
        setErrorMessage("Please fill all certificate details (PAN Number, Address, City, State, Pincode) to receive 80G Certificate");
        

        if (!formData.panNumber) {
          const field = document.querySelector('input[name="panNumber"]');
          if (field) {
            field.style.border = '2px solid #ff4444';
            field.scrollIntoView({ behavior: 'smooth', block: 'center' });
            field.focus();
          }
        } else if (!formData.address) {
          const field = document.querySelector('input[name="address"]');
          if (field) {
            field.style.border = '2px solid #ff4444';
            field.scrollIntoView({ behavior: 'smooth', block: 'center' });
            field.focus();
          }
        } else if (!formData.city) {
          const field = document.querySelector('input[name="city"]');
          if (field) {
            field.style.border = '2px solid #ff4444';
            field.scrollIntoView({ behavior: 'smooth', block: 'center' });
            field.focus();
          }
        } else if (!formData.state) {
          const field = document.querySelector('select[name="state"]');
          if (field) {
            field.style.border = '2px solid #ff4444';
            field.scrollIntoView({ behavior: 'smooth', block: 'center' });
            field.focus();
          }
        } else if (!formData.pincode) {
          const field = document.querySelector('input[name="pincode"]');
          if (field) {
            field.style.border = '2px solid #ff4444';
            field.scrollIntoView({ behavior: 'smooth', block: 'center' });
            field.focus();
          }
        }
        return;
      }
    }

    if (!finalAmount || finalAmount <= 0) {
      setErrorMessage("Invalid donation amount");
      return;
    }

    try {
      setLoading(true);

      // Load Razorpay lazily if not already loaded
      const razorpayLoaded = await loadRazorpay();
      if (!razorpayLoaded) {
        alert("Payment gateway failed to load. Please check your connection.");
        setLoading(false);
        return;
      }

      const endpoint =
        type === "one"
          ? "create-order"
          : "create-subscription";

      
      let utm = null;
      try {
        utm = JSON.parse(localStorage.getItem("utm"));
      } catch {}
      const tracking = getMetaBrowserIds();

      const response = await fetch(
        `https://subhojanam-server-main-882278565284.asia-south1.run.app/api/payment/${endpoint}`,
          // `http://localhost:8080/api/payment/${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            amount: finalAmount,
            tracking,
            ...(utm ? { utm } : {})
          })
        }
      );

const data = await response.json();

// console.log("Response status:", response.status);
// console.log("Response data:", data);

      if (!data.key) {
        alert("Payment initialization failed");
        setLoading(false);
        return;
      }

      const options = {
        key: data.key,
        currency: "INR",
        name: "ISKCON Visakhapatnam",
        image: "https://annadan.harekrishnavizag.org/assets/logo-D-uVL5iO.png",
        description:
          type === "one"
            ? "Annadana Seva - One-time Donation"
            : "Annadana Seva - Monthly Donation",

        ...(type === "one"
          ? {
              amount: finalAmount * 100,
              order_id: data.orderId
            }
          : {
              subscription_id: data.subscriptionId
            }),

        handler: function (response) {
          // 🔥 Fire Purchase on successful payment
          fbEvent.purchase(
            finalAmount,
            response.razorpay_payment_id || response.razorpay_subscription_id
          );

          setShowForm(false);

          const params = new URLSearchParams({
            txn:
              response.razorpay_payment_id ||
              response.razorpay_subscription_id ||
              "TXN123456",
            amount: String(finalAmount),
            name: formData.name,
            email: formData.email,
            method: "Razorpay",
            type: type === "one" ? "One-Time" : "Monthly",
            currency: "INR",
            donationId: data.donationId,
            certificate: formData.certificate
          });

          navigate(`/thankyou?${params.toString()}`);
        },

        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.mobile
        },

        theme: {
          color: "#0A97EF"
        },

        modal: {
          ondismiss: function () {
            // 🔥 Fire PaymentAbandoned when user closes Razorpay without paying
            fbEvent.paymentAbandoned(finalAmount);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

      // 🔥 Fire InitiateCheckout when Razorpay popup opens
      fbEvent.initiateCheckout(finalAmount);

      setLoading(false);

    } catch (error) {
  console.error("Frontend Error:", error);
  alert("Payment failed. Check console.");
  setLoading(false);
}
  };

  return (
    <>
  <section className="main-section" id="donate">
        <div className="box">

          <h2>Support Annadana Seva</h2>
          <p>Every ₹25 feeds one soul — serve hot prasadam to the needy today</p>

          <div className="toggle">
            <button
              className={type === "one" ? "active" : ""}
              onClick={() => handleTypeChange("one")}
            >
              One-time Donation
            </button>

            <button
              className={type === "monthly" ? "active" : ""}
              onClick={() => handleTypeChange("monthly")}
            >
              Monthly Donation
            </button>
          </div>

          <div className="cards">
            {(type === "monthly" ? monthlyDonationOptions : donationOptions).map((item) => (
              <div
                key={item.amount}
                className={`card 
                  ${selectedAmount === item.amount ? "selected" : ""}
                  ${item.popular && type === "one" ? "special" : ""}
                `}
                onClick={() => handleSelect(item.amount)}
              >
                {item.popular && type === "one" && <div className="tag">MOST DONATED</div>}
                <h3>₹{item.amount.toLocaleString()}</h3>
                <p>
                  {type === "monthly"
                    ? `Serve ${item.meals} Meals Every Month`
                    : `Serve ${item.meals} Hot Meals`}
                </p>
                <span>@ ₹25 per meal</span>
              </div>
            ))}
          </div>

          {type === "one" && (
            <button
              className="special-day-text"
              onClick={() => {
                setCustomAmount("25000");
                setSelectedAmount(null);
              }}
            >
              Annadana served on my special day (₹ 25,000)
            </button>
          )}

          <div style={{ position: 'relative', marginBottom: '8px', width: '100%' }}>
            <span
              style={{
                position: 'absolute',
                left: '12px',
                top: '32%',
                transform: 'translateY(-32%)',
                color: '#FFD700',
                fontWeight: 'bold',
                pointerEvents: 'none',
                zIndex: 2,
              }}
            >₹</span>
            <input
              type="number"
                min="25"
                placeholder="Enter custom amount"
              className="input-box"
              value={customAmount}
              onChange={handleCustomChange}
              style={{ paddingLeft: '32px', width: '100%' , fontWeight:"bold" }}
            />
              {isCustomAmountInvalid && !minAmountLoading && minAmountTried && (
                <div style={{ color: 'red', fontSize: '13px', marginTop: '2px' }}>
                  Minimum amount for donation is 25
                </div>
              )}
          </div>

          {finalAmount > 0 && (
            <p className="meal-info">
              This will serve {meals} hot meals {type === "monthly" ? "every month" : ""}
            </p>
          )}

          <button
            className="big-btn"
            disabled={!finalAmount || minAmountLoading}
            onClick={async () => {
              setMinAmountTried(true);
              if (isCustomAmountInvalid) {
                setMinAmountLoading(true);
                setErrorMessage("");
                await new Promise((resolve) => setTimeout(resolve, 1500));
                setMinAmountLoading(false);
                setErrorMessage("Minimum amount for donation is 25");
                return;
              } else {
                setErrorMessage("");
              }
              fbEvent.viewContent(finalAmount);
              setShowForm(true);
            }}
          >
            {minAmountLoading ? "Checking..." : "Donate Now & Feed a Soul →"}
          </button>

          <div className="small-info">
            <span className="info-item">
              <span className="info-icon-circle">
                <Lock className="info-icon" size={11} />
              </span>
              Secure Payment
            </span>
            <span className="info-separator">•</span>
            <span className="info-item">
              <span className="info-icon-circle">
                <FileText className="info-icon" size={11} />
              </span>
              80G Tax Exempt
            </span>
            <span className="info-separator">•</span>
            <span className="info-item">
              <span className="info-icon-circle">
                <Check className="info-icon" size={11} />
              </span>
              100% to Food
            </span>
          </div>

        </div>
      </section>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>

            <button className="close-btn" onClick={() => setShowForm(false)}>✕</button>

            <h3>Complete Your Seva</h3>

            <div className="form-grid">

              <input type="text" name="name" placeholder="Donor Name *" className="form-field" onChange={handleChange} />
              <input type="tel" name="mobile" placeholder="Mobile Number *" className="form-field" onChange={handleChange} />
              <input type="email" name="email" placeholder="Email Address (Optional)" className="form-field" onChange={handleChange} />

              <select name="occasion" className="form-field" onChange={handleChange}>
                <option value="">Occasion (Optional)</option>
                <option>Birthday</option>
                <option>Anniversary</option>
                <option>Memorial</option>
                <option>Other</option>
              </select>

              <div className="date-row">
                <div className="date-field-wrapper">
                  <label className="date-label">Seva Date (Optional)</label>
                  <input type="date" name="sevaDate" className="form-field" onChange={handleChange} />
                </div>
                <div className="date-field-wrapper">
                  <label className="date-label">Date of Birth (Optional)</label>
                  <input type="date" name="dob" className="form-field" onChange={handleChange} />
                </div>
              </div>

              <input 
                type="text" 
                className="amount-input-blocked" 
                value={`₹${finalAmount.toLocaleString()}`}
                readOnly
                disabled
              />
              
              <div className="meal-message">
                ❤️ Your donation will serve {meals} hot meals today 🙏
              </div>

              {finalAmount >= 1000 && (
                <label className="checkbox-row">
                  <input type="checkbox" name="certificate" onChange={handleChange} />
                  <span>I would like to receive 80(G) Certificate</span>
                </label>
              )}

              {finalAmount >= 1000 && (
                <label className="checkbox-row">
                  <input type="checkbox" name="mahaprasadam" onChange={handleChange} />
                  <span>I would like to receive Maha Prasadam only within India</span>
                </label>
              )}

              {formData.mahaprasadam && finalAmount >= 1000 && (
                <div className="prasadam-address-section">
                  <p className="section-label">Maha Prasadam Delivery Address:</p>
                  
                  <label className="radio-row">
                    <input 
                      type="radio" 
                      name="prasadamAddressOption" 
                      value="same"
                      checked={formData.prasadamAddressOption === "same"}
                      onChange={handleChange}
                    />
                    <span>Same as above</span>
                  </label>

                  <label className="radio-row">
                    <input 
                      type="radio" 
                      name="prasadamAddressOption" 
                      value="different"
                      checked={formData.prasadamAddressOption === "different"}
                      onChange={handleChange}
                    />
                    <span>I want to provide different address</span>
                  </label>

                  {formData.prasadamAddressOption === "different" && (
                    <textarea
                      name="prasadamAddress"
                      placeholder="Enter complete delivery address with pincode *"
                      className="form-field address-textarea"
                      rows="4"
                      onChange={handleChange}
                      value={formData.prasadamAddress}
                    />
                  )}
                </div>
              )}

              {formData.certificate && (
                <div className="certificate-fields">
                  <input 
                    type="text" 
                    name="panNumber" 
                    placeholder="PAN Number *" 
                    className="form-field" 
                    onChange={handleChange} 
                    value={formData.panNumber}
                  />
                  <input 
                    type="text" 
                    name="address" 
                    placeholder="Full Address *" 
                    className="form-field" 
                    onChange={handleChange} 
                    value={formData.address}
                  />
                  <div className="address-row">
                    <input 
                      type="text" 
                      name="city" 
                      placeholder="City *" 
                      className="form-field" 
                      onChange={handleChange} 
                      value={formData.city}
                    />
                    <select 
                      name="state" 
                      className="form-field" 
                      onChange={handleChange} 
                      value={formData.state}
                    >
                      <option value="">Select State *</option>
                      <option value="Andhra Pradesh">Andhra Pradesh</option>
                      <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                      <option value="Assam">Assam</option>
                      <option value="Bihar">Bihar</option>
                      <option value="Chhattisgarh">Chhattisgarh</option>
                      <option value="Goa">Goa</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Haryana">Haryana</option>
                      <option value="Himachal Pradesh">Himachal Pradesh</option>
                      <option value="Jharkhand">Jharkhand</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Kerala">Kerala</option>
                      <option value="Madhya Pradesh">Madhya Pradesh</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Manipur">Manipur</option>
                      <option value="Meghalaya">Meghalaya</option>
                      <option value="Mizoram">Mizoram</option>
                      <option value="Nagaland">Nagaland</option>
                      <option value="Odisha">Odisha</option>
                      <option value="Punjab">Punjab</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="Sikkim">Sikkim</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Telangana">Telangana</option>
                      <option value="Tripura">Tripura</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="Uttarakhand">Uttarakhand</option>
                      <option value="West Bengal">West Bengal</option>
                      <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                      <option value="Chandigarh">Chandigarh</option>
                      <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                      <option value="Ladakh">Ladakh</option>
                      <option value="Lakshadweep">Lakshadweep</option>
                      <option value="Puducherry">Puducherry</option>
                    </select>
                  </div>
                  <input 
                    type="text" 
                    name="pincode" 
                    placeholder="Pincode *" 
                    className="form-field" 
                    onChange={handleChange} 
                    value={formData.pincode}
                  />
                </div>
              )}

              <label className="checkbox-row">
                <input type="checkbox" name="updates" defaultChecked onChange={handleChange} />
                <span>I wish to receive updates from ISKCON Visakhapatnam</span>
              </label>

            </div>

            {errorMessage && !minAmountLoading && (
              <div style={{
                backgroundColor: '#fee',
                color: '#c33',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '14px',
                fontWeight: '500',
                border: '1px solid #fcc'
              }}>
                {errorMessage}
              </div>
            )}

            <button
              className="big-btn modal-btn"
              onClick={handlePayment}
              disabled={loading}
            >
              {loading ? "Processing..." : `Proceed to Pay ₹${finalAmount.toLocaleString()} 🔒`}
            </button>

          </div>
        </div>
      )}
    </>
  );
}

export default DonationSection;
