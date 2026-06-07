// Meta Pixel Event Helpers
// Pixel ID: 2113801186145331

export const fbEvent = {
  viewContent: (amount) => {
    if (!window.fbq) return;
    window.fbq('track', 'ViewContent', {
      content_name: 'Annadana Seva Donation Form',
      currency: 'INR',
      value: amount,
    });
  },

  initiateCheckout: (amount) => {
    if (!window.fbq) return;
    window.fbq('track', 'InitiateCheckout', {
      content_name: 'Annadana Seva',
      currency: 'INR',
      value: amount,
      num_items: Math.floor(amount / 25),
    });
  },

  purchase: (amount, paymentId) => {
    if (!window.fbq) return;
    // Fire both Purchase and Donate for maximum tracking coverage
    window.fbq('track', 'Purchase', {
      content_name: 'Annadana Seva',
      currency: 'INR',
      value: amount,
      num_items: Math.floor(amount / 25),
      content_ids: [paymentId],
    }, paymentId ? { eventID: paymentId } : undefined);

    const donateAmount = Number(amount) || 0;
    window.fbq('track', 'Donate', {
      content_name: 'Annadana Seva',
      currency: 'INR',
      value: donateAmount,
    }, paymentId ? { eventID: `donate_${paymentId}` } : undefined);
  },

  paymentAbandoned: (amount) => {
    if (!window.fbq) return;
    window.fbq('trackCustom', 'PaymentAbandoned', {
      currency: 'INR',
      value: amount,
    });
  },
};
