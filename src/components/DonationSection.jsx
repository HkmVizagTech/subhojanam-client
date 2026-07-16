
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, FileText, Check } from "lucide-react";
import "../styles/donation.css";
import { fbEvent } from "../lib/fbPixel";
import { apiBaseUrl } from "../lib/apiConfig.js";
import { getMetaBrowserIds, captureTrackingData, getStoredTracking } from "../utils/tracking.js";

function DonationSection() {

  useEffect(() => {
    // Capture all tracking data — UTM, ref param, slug, or auto-referrer
    captureTrackingData();

    // Fetch festival campaign minimum donation amount, if any
    const utmCampaign = new URLSearchParams(window.location.search).get("utm_campaign");
    if (utmCampaign) {
      fetch(apiBaseUrl(`/api/public/festival-campaign?utmCampaign=${encodeURIComponent(utmCampaign)}`))
        .then(res => res.json())
        .then(data => {
          if (data.success && data.campaign?.minDonationAmount) {
            const min = data.campaign.minDonationAmount;
            setCampaignMinAmount(min);
            // Bump the default pre-selected amount up to the campaign minimum if needed
            setSelectedAmount(prev => (prev < min ? min : prev));
          }
        })
        .catch(() => {});
    }

    const params = new URLSearchParams(window.location.search);

    // Auto-switch to monthly tab if ?type=monthly
    const typeParam = params.get('type');
    if (typeParam === 'monthly') {
      setType('monthly');
      // Scroll to donation section smoothly
      setTimeout(() => {
        const el = document.getElementById('donate');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 500);
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
  const [selectedAmount, setSelectedAmount] = useState(1251);
  const [customAmount, setCustomAmount] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [paymentFailed, setPaymentFailed] = useState(null); // { reason, code, method }
  const [minAmountLoading, setMinAmountLoading] = useState(false);
  const [minAmountTried, setMinAmountTried] = useState(false);
  const [campaignMinAmount, setCampaignMinAmount] = useState(100);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    occasion: "",
    sevaDate: "",
    sevakName: "",
    sevakMobile: "",
    dob: "",
    certificate: false,
    mahaprasadam: false,
    prasadamAddressOption: "same",
    prasadamAddress: "",
    prasadamName: "",
    prasadamMobile: "",
    prasadamCity: "",
    prasadamState: "",
    prasadamPincode: "",
    panNumber: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    updates: true
  });

  const donationOptions = [
    { amount: 501, meals: 20 },
    { amount: 1251, meals: 50 },
    { amount: 2500, meals: 100, popular: true },
    { amount: 3000, meals: 120 }
  ];

  const monthlyDonationOptions = [
    { amount: 500, meals: 20 },
    { amount: 1000, meals: 40 },
    { amount: 1500, meals: 60 },
    { amount: 2000, meals: 80 },
    { amount: 2500, meals: 100, popular: true },
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

  const isCustomAmountInvalid = customAmount !== "" && Number(customAmount) < 100;

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
    setPaymentFailed(null);
  
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
        utm = getStoredTracking();
      } catch {}
      const tracking = {
        ...getMetaBrowserIds(),
        pageUrl: window.location.origin,
      };

      const response = await fetch(apiBaseUrl(`/api/payment/${endpoint}`),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            amount: finalAmount,
            // Resolve prasadam address correctly for all cases
            prasadamAddress: formData.mahaprasadam
              ? formData.certificate && formData.prasadamAddressOption === "same"
                // Case 1: Certificate + same address → use certificate address
                ? `${formData.address || ""}, ${formData.city || ""}, ${formData.state || ""} - ${formData.pincode || ""}`.trim().replace(/^,\s*/, "")
                // Case 2: No certificate OR different address → use typed address
                : `${formData.prasadamAddress || ""}, ${formData.prasadamCity || ""}, ${formData.prasadamState || ""} - ${formData.prasadamPincode || ""}`.trim().replace(/^,\s*/, "")
              : "",
            prasadamName: formData.mahaprasadam && (!formData.certificate || formData.prasadamAddressOption === "different")
              ? formData.prasadamName : "",
            prasadamMobile: formData.mahaprasadam && (!formData.certificate || formData.prasadamAddressOption === "different")
              ? formData.prasadamMobile : "",
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
          email: formData.email || "donor@harekrishnavizag.org",
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

      // Handle payment failures (card declined, UPI timeout, insufficient funds, etc.)
      rzp.on("payment.failed", function (response) {
        const err = response?.error || {};
        const code = err.code || "";
        const reason = err.description || "Your payment could not be completed.";
        const method = err.metadata?.payment_method || "";
        setPaymentFailed({ reason, code, method, amount: finalAmount });
        setLoading(false);
        try { fbEvent.paymentAbandoned(finalAmount); } catch {}
      });

      rzp.open();

      // 🔥 Fire InitiateCheckout when Razorpay popup opens
      fbEvent.initiateCheckout(finalAmount);

      setLoading(false);

    } catch (error) {
      console.error("Payment error:", error);
      setErrorMessage("Something went wrong while starting the payment. Please refresh the page and try again, or use the PhonePe/UPI option below.");
      setLoading(false);
    }
  };

  return (
    <>
  <section className="main-section" id="donate">
        <div className="box">

          <h2>Support Annadana Seva</h2>
          <p>Every meal you sponsor brings a smile — serve hot prasadam to the needy today 🙏</p>

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
            {(type === "monthly" ? monthlyDonationOptions : donationOptions)
              .filter((item) => item.amount >= campaignMinAmount)
              .map((item) => (
              <div
                key={item.amount}
                className={`card 
                  ${selectedAmount === item.amount ? "selected" : ""}
                  ${item.popular ? "special" : ""}
                `}
                onClick={() => handleSelect(item.amount)}
              >
                {item.popular && <div className="tag">MOST DONATED</div>}
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
                min="100"
                placeholder="Enter custom amount"
              className="input-box"
              value={customAmount}
              onChange={handleCustomChange}
              style={{ paddingLeft: '32px', width: '100%' , fontWeight:"bold" }}
            />
              {isCustomAmountInvalid && !minAmountLoading && minAmountTried && (
                <div style={{ color: 'red', fontSize: '13px', marginTop: '2px' }}>
                  Minimum donation is ₹100 (4 meals)
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
                setErrorMessage("Minimum donation is ₹100 (4 meals)");
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

              {(formData.occasion === "Birthday" || formData.occasion === "Anniversary") && (
                <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "10px", padding: "14px", marginTop: "4px" }}>
                  <div style={{ fontSize: "12px", color: "#0369a1", fontWeight: "600", marginBottom: "10px" }}>
                    🎁 Donating in someone's honour? Add their details to send them a wish on this day every year.
                  </div>
                  <input
                    type="text"
                    name="sevakName"
                    placeholder={`${formData.occasion === "Birthday" ? "Birthday" : "Anniversary"} person's name`}
                    className="form-field"
                    onChange={handleChange}
                    style={{ marginBottom: "8px" }}
                  />
                  <input
                    type="tel"
                    name="sevakMobile"
                    placeholder="Their mobile number (optional — wish goes to them)"
                    className="form-field"
                    onChange={handleChange}
                  />
                  <div style={{ fontSize: "11px", color: "#64748b", marginTop: "6px" }}>
                    If mobile is provided → wish goes to them. If not → wish goes to you mentioning their name.
                  </div>
                </div>
              )}

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
                  <p className="section-label">Maha Prasadam Delivery Details:</p>

                  {/* Only show "Same as above" if certificate address was filled */}
                  {formData.certificate && (
                    <>
                      <label className="radio-row">
                        <input
                          type="radio"
                          name="prasadamAddressOption"
                          value="same"
                          checked={formData.prasadamAddressOption === "same"}
                          onChange={handleChange}
                        />
                        <span>Same as certificate address</span>
                      </label>
                      <label className="radio-row">
                        <input
                          type="radio"
                          name="prasadamAddressOption"
                          value="different"
                          checked={formData.prasadamAddressOption === "different"}
                          onChange={handleChange}
                        />
                        <span>Deliver to a different address</span>
                      </label>
                    </>
                  )}

                  {/* Show delivery fields when:
                      - No certificate selected, OR
                      - Certificate selected but "different" chosen */}
                  {(!formData.certificate || formData.prasadamAddressOption === "different") && (
                    <div className="prasadam-fields">
                      <input
                        type="text"
                        name="prasadamName"
                        placeholder="Recipient Name *"
                        className="form-field"
                        onChange={handleChange}
                        value={formData.prasadamName}
                      />
                      <input
                        type="tel"
                        name="prasadamMobile"
                        placeholder="Recipient Mobile Number *"
                        className="form-field"
                        onChange={handleChange}
                        value={formData.prasadamMobile}
                      />
                      <textarea
                        name="prasadamAddress"
                        placeholder="Door No, Street, Area *"
                        className="form-field address-textarea"
                        rows="3"
                        onChange={handleChange}
                        value={formData.prasadamAddress}
                      />
                      <div className="address-row">
                        <input
                          type="text"
                          name="prasadamCity"
                          placeholder="City *"
                          className="form-field"
                          onChange={handleChange}
                          value={formData.prasadamCity}
                        />
                        <input
                          type="text"
                          name="prasadamPincode"
                          placeholder="Pincode *"
                          className="form-field"
                          onChange={handleChange}
                          value={formData.prasadamPincode}
                          maxLength="6"
                        />
                      </div>
                      <input
                        type="text"
                        name="prasadamState"
                        placeholder="State *"
                        className="form-field"
                        onChange={handleChange}
                        value={formData.prasadamState}
                      />
                    </div>
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

            {paymentFailed && (
              <div style={{
                background: "#fff8f0",
                border: "1px solid #f5c5a3",
                borderRadius: "14px",
                padding: "18px",
                marginBottom: "16px",
              }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "12px" }}>
                  <span style={{ fontSize: "22px", lineHeight: 1 }}>⚠️</span>
                  <div>
                    <div style={{ fontSize: "15px", fontWeight: "700", color: "#b45309", marginBottom: "3px" }}>
                      Payment could not be completed
                    </div>
                    <div style={{ fontSize: "13px", color: "#78350f" }}>
                      {paymentFailed.code === "BAD_REQUEST_ERROR"
                        ? "Your bank declined this transaction."
                        : paymentFailed.code === "GATEWAY_ERROR"
                        ? "The payment gateway had a temporary issue."
                        : paymentFailed.reason}
                    </div>
                  </div>
                </div>

                {/* What to do */}
                <div style={{ fontSize: "12.5px", color: "#92400e", marginBottom: "14px", lineHeight: 1.6 }}>
                  {paymentFailed.code === "BAD_REQUEST_ERROR" ? (
                    <>Try a different payment method below, or enable online transactions in your bank app.</>
                  ) : paymentFailed.code === "GATEWAY_ERROR" ? (
                    <>This is temporary — please wait a moment and try again.</>
                  ) : (
                    <>Please try again or use a different payment method.</>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  <button
                    onClick={handlePayment}
                    style={{
                      background: "var(--brand-primary, #0A97EF)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "10px",
                      padding: "10px 18px",
                      fontSize: "13px",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    🔄 Try Again
                  </button>

                  <button
                    onClick={() => {
                      const el = document.getElementById("phonepe-section") || document.querySelector(".phonepe-strip");
                      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    style={{
                      background: "#5f259f",
                      color: "#fff",
                      border: "none",
                      borderRadius: "10px",
                      padding: "10px 18px",
                      fontSize: "13px",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    📱 Pay via PhonePe / UPI
                  </button>

                  <button
                    onClick={() => setPaymentFailed(null)}
                    style={{
                      background: "none",
                      border: "1px solid #e5e7eb",
                      borderRadius: "10px",
                      padding: "10px 14px",
                      fontSize: "13px",
                      color: "#888",
                      cursor: "pointer",
                    }}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

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
