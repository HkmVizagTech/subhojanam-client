import hkmiLogo from "../assets/hkmi-logo.jpg";
import hkmiStamp from "../assets/hkmi-stamp-removebg-preview.png";

const DonationReceipt = ({ donationData }) => {
  const formatAmount = (amount) => {
    return Number(amount).toLocaleString("en-IN");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // ✅ FIXED: Check if receipt number already has the HKMI format
  const formatReceiptNumber = (receiptNumber) => {
    if (!receiptNumber) return "N/A";

    // If it's already a string containing the HKMI format, return as-is
    if (typeof receiptNumber === "string" && receiptNumber.includes("HKMI|")) {
      return receiptNumber;
    }

    // Otherwise, format it locally (fallback for old receipts)
    const year = new Date().getFullYear();
    const paddedNumber = String(receiptNumber).padStart(5, "0");
    return `HKMI|${year}|D/VSP|${paddedNumber}`;
  };

  const formatAddress = () => {
    const parts = [
      donationData.address,
      donationData.city,
      donationData.state,
      donationData.pincode,
    ].filter(Boolean);
    return parts.join(" , ");
  };

  return (
    <div
      className="receipt-container"
      style={{
        width: "718px",
        margin: "0 auto",
        background: "#fff",
        padding: 0,
        fontFamily: "Helvetica, Arial, sans-serif",
      }}
    >
      <div style={{ padding: "20px 50px 10px 50px" }}>
        <div
          style={{
            textAlign: "right",
            marginTop: "76px",
            marginBottom: "76px",
          }}
        >
          <h2
            style={{
              fontSize: "16px",
              fontWeight: "bold",
              color: "hsla(168, 3%, 65%, 1.00)",
              fontFamily: "Helvetica, Arial, sans-serif",
            }}
          >
            DONATION{" "}
            <span
              style={{
                fontSize: "16px",
                fontWeight: "bold",
                color: "hsla(168, 3%, 65%, 1.00)",
                fontFamily: "Helvetica, Arial, sans-serif",
              }}
            >
              Acknowledgement
            </span>
          </h2>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "15px",
            marginBottom: "10px",
          }}
        >
          <div style={{ flexShrink: 0 }}>
            <img
              src={hkmiLogo}
              alt="HKMI Logo"
              style={{
                width: "130px",
                height: "auto",
                display: "block",
                marginTop: "19px",
              }}
            />
          </div>
          <div style={{ flex: 1, textAlign: "right" }}>
            <h1
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#000",
                lineHeight: 1.2,
                marginBottom: "4px",
                fontFamily: "Helvetica, Arial, sans-serif",
              }}
            >
              HARE KRISHNA MOVEMENT INDIA
            </h1>
            <p
              style={{
                fontSize: "11px",
                color: "#000",
                lineHeight: 1.6,
                margin: 0,
                fontFamily: "Helvetica, Arial, sans-serif",
              }}
            >
              (Serving the Mission of His Divine Grace A.C. Bhaktivendanta swami
              Prabhupada)
            </p>
            <p
              style={{
                fontSize: "11px",
                color: "#000",
                lineHeight: 1.6,
                margin: 0,
                fontFamily: "Helvetica, Arial, sans-serif",
              }}
            >
              Branch Office : #8-22, Near RTO Office, Next to Akshaya Patra
              Foundation Kitchen,
            </p>
            <p
              style={{
                fontSize: "11px",
                color: "#000",
                lineHeight: 1.6,
                margin: 0,
                fontFamily: "Helvetica, Arial, sans-serif",
              }}
            >
              IIM Road, Gambheeram, Visakhapatanam - 530052. (A.P.) INDIA.
            </p>
            <p
              style={{
                fontSize: "11px",
                color: "#000",
                lineHeight: 1.6,
                margin: 0,
                fontFamily: "Helvetica, Arial, sans-serif",
              }}
            >
              Phone : +91 9030696108, E-mail : donorcare@hkmvizag.org
            </p>
            <p
              style={{
                fontSize: "11px",
                color: "#000",
                lineHeight: 1.6,
                margin: 0,
                fontFamily: "Helvetica, Arial, sans-serif",
              }}
            >
              HKMI PAN No : AABTH4550P
            </p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginTop: "20px",
            marginBottom: "5px",
          }}
        >
          <div style={{ flex: 1 }}>
            <h2
              style={{
                fontSize: "16px",
                fontWeight: "bold",
                color: "#000",
                textDecoration: "underline",
                textUnderlineOffset: "4px",
                textAlign: "center",
                fontFamily: "Helvetica, Arial, sans-serif",
              }}
            >
              DONATION RECEIPT
            </h2>
          </div>
          <div style={{ textAlign: "right", fontSize: "13px" }}>
            <p
              style={{ margin: 0, fontFamily: "Helvetica, Arial, sans-serif" }}
            >
              Ref No.{" "}
              <span style={{ fontWeight: "bold" }}>
                {formatReceiptNumber(donationData.receiptNumber)}
              </span>
            </p>
          </div>
        </div>

        <div
          style={{ textAlign: "right", fontSize: "13px", marginBottom: "15px" }}
        >
          <p style={{ margin: 0, fontFamily: "Helvetica, Arial, sans-serif" }}>
            Date:{" "}
            <span style={{ fontWeight: "bold" }}>
              {formatDate(donationData.receiptDate)}
            </span>
          </p>
        </div>

        <div
          style={{
            fontSize: "13px",
            lineHeight: 2,
            color: "#000",
            fontFamily: "Helvetica, Arial, sans-serif",
          }}
        >
          <p style={{ margin: 0 }}>Name of the Donor : {donationData.name}</p>
          <p style={{ margin: 0 }}>Address : {formatAddress()}</p>

          {/* ✅ UPDATED: Changed to Donor ID with dynamic value */}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <p style={{ margin: 0 }}>
              Donor ID :{" "}
              <span style={{ fontWeight: "bold" }}>
                {donationData.donorNumber || "N/A"}
              </span>
            </p>
            <p style={{ margin: 0, width: "40%" }}>Sevak Name :</p>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <p style={{ margin: 0 }}>
              Phone : Res : &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Off :
            </p>
            <p style={{ margin: 0, width: "40%" }}>
              Mobile : {donationData.mobile}
            </p>
          </div>

          <p style={{ margin: 0 }}>
            Tax exemption Required{" "}
            <span style={{ fontWeight: "bold" }}>
              {donationData.certificate}
            </span>{" "}
            (Under section 80G, of the Income Tax Act)
          </p>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <p style={{ margin: 0 }}>E-mail : {donationData.email}</p>
            <p style={{ margin: 0, width: "40%" }}>
              PAN : {donationData.panNumber}
            </p>
          </div>

          <div style={{ display: "flex" }}>
            <p style={{ margin: 0, width: "100px" }}>
              Rs.{" "}
              <span style={{ fontWeight: "bold" }}>
                {formatAmount(donationData.amount)} /-
              </span>
            </p>
            <p style={{ margin: 0, marginLeft: "20px" }}>
              Rupees :{" "}
              <span style={{ fontWeight: "bold" }}>
                {donationData.amountInWords || ""}
              </span>
            </p>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ display: "flex" }}>
              <p style={{ margin: 0, width: "100px" }}>
                by <span style={{ fontWeight: "bold" }}>Online</span>
              </p>
              <p style={{ margin: 0, marginLeft: "20px" }}>
                Reference No : {donationData.razorpayPaymentId}
              </p>
            </div>
            <p style={{ margin: 0, width: "40%" }}>
              Date : {formatDate(donationData.receiptDate)}
            </p>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ display: "flex" }}>
              <p style={{ margin: 0, width: "100px" }}>Bank :</p>
            </div>
            <p style={{ margin: 0, width: "40%" }}>
              Towards :{" "}
              <span style={{ fontWeight: "bold" }}>Annadana Seva</span>
            </p>
          </div>
        </div>

        <p
          style={{
            fontSize: "11px",
            marginTop: "8px",
            color: "#000",
            fontFamily: "Helvetica, Arial, sans-serif",
          }}
        >
          *Cheque Payment : Subject to realization. We do not accept anonymous
          donations.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "50px",
            marginBottom: "10px",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <img
              src={hkmiStamp}
              alt="HKMI Stamp"
              style={{
                width: "90px",
                height: "90px",
                margin: "0 auto 5px auto",
                display: "block",
              }}
            />
            <p
              style={{
                fontSize: "13px",
                margin: 0,
                fontFamily: "Helvetica, Arial, sans-serif",
              }}
            >
              for <span style={{ fontWeight: "bold" }}>HKM INDIA</span>
            </p>
          </div>
        </div>

        <div
          style={{
            textAlign: "center",
            marginTop: "15px",
            fontSize: "10px",
            color: "#000",
            lineHeight: 1.8,
            fontFamily: "Helvetica, Arial, sans-serif",
          }}
        >
          <p style={{ margin: 0 }}>
            Regd. & Head office : Sri Radha Vrindavan Chandra Mandir, Chatikara
            Road, Vrindavan, Mathura District, U.P. - 281 121
          </p>
          <p style={{ marginTop: "5px", fontSize: "11px" }}>
            Hare Krishna Hare Krishna Krishna Krishna Hare Hare Hare Rama Hare
            Rama Rama Rama Hare Hare
          </p>
        </div>

        <p
          style={{
            textAlign: "center",
            fontSize: "11px",
            marginTop: "30px",
            marginBottom: "38px",
            color: "#000",
            fontFamily: "Helvetica, Arial, sans-serif",
          }}
        >
          *This is an electronically generated receipt, hence does not require
          signature
        </p>
      </div>
    </div>
  );
};

export default DonationReceipt;
