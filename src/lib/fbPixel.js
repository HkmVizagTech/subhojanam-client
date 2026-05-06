// Meta Pixel Event Helpers
// Pixel ID: 3766034960331245

export const fbEvent = {
  /**
   * Fire when donation form becomes visible to the user
   */
  viewContent: (amount) => {
    if (!window.fbq) return;
    window.fbq('track', 'ViewContent', {
      content_name: 'Annadana Seva Donation Form',
      currency: 'INR',
      value: amount,
    });
  },

  /**
   * Fire when user clicks "Proceed to Pay" button (before Razorpay opens)
   */
  initiateCheckout: (amount) => {
    if (!window.fbq) return;
    window.fbq('track', 'InitiateCheckout', {
      content_name: 'Annadana Seva',
      currency: 'INR',
      value: amount,
      num_items: Math.floor(amount / 25),
    });
  },

  /**
   * Fire inside Razorpay handler on successful payment
   */
  purchase: (amount, paymentId) => {
    if (!window.fbq) return;
    window.fbq('track', 'Purchase', {
      content_name: 'Annadana Seva',
      currency: 'INR',
      value: amount,
      num_items: Math.floor(amount / 25),
      content_ids: [paymentId],
    }, paymentId ? { eventID: paymentId } : undefined);
  },

  /**
   * Fire when user closes Razorpay popup without paying
   */
  paymentAbandoned: (amount) => {
    if (!window.fbq) return;
    window.fbq('trackCustom', 'PaymentAbandoned', {
      currency: 'INR',
      value: amount,
    });
  },
};
