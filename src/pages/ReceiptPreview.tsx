import { useSearchParams } from "react-router-dom";
import DonationReceipt from "../components/DonationReceipt";
import "../styles/receipt-print.css";
import { useEffect } from "react";

const ReceiptPreview = () => {
  const [searchParams] = useSearchParams();

  const donationData = {
    name: searchParams.get("name") || "",
    amount: searchParams.get("amount") || "",
    amountInWords: searchParams.get("amountInWords") || "",
    receiptNumber: searchParams.get("receiptNumber") || "",
    receiptDate: searchParams.get("receiptDate") || "",
    mobile: searchParams.get("mobile") || "",
    email: searchParams.get("email") || "",
    address: searchParams.get("address") || "",
    city: searchParams.get("city") || "",
    state: searchParams.get("state") || "",
    pincode: searchParams.get("pincode") || "",
    panNumber: searchParams.get("panNumber") || "",
    certificate: searchParams.get("certificate") || "NO",
    razorpayPaymentId: searchParams.get("razorpayPaymentId") || "",
    donorNumber: searchParams.get("donorNumber") || "", // ✅ ADD THIS LINE
  };

  const autoPrint = searchParams.get("autoPrint") === "true";

  useEffect(() => {
    document.title = `Annadhan_Certificate_${donationData.receiptNumber || ""}`;
    if (autoPrint) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [autoPrint, donationData.receiptNumber]);

  return (
    <div className="min-h-screen bg-muted py-8 flex items-start justify-center">
      <DonationReceipt donationData={donationData} />
    </div>
  );
};

export default ReceiptPreview;
