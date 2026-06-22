// Meta Pixel Event Helpers
// Pixel ID: 3766034960331245

export const fbEvent = {
  viewContent: (amount) => {
    if (!window.fbq) return;
    const value = parseFloat(Number(amount).toFixed(2)) || 0;
    window.fbq('track', 'ViewContent', {
      content_name: 'Annadana Seva Donation Form',
      currency: 'INR',
      value,
    });
  },

  initiateCheckout: (amount) => {
    if (!window.fbq) return;
    const value = parseFloat(Number(amount).toFixed(2)) || 0;
    window.fbq('track', 'InitiateCheckout', {
      content_name: 'Annadana Seva',
      currency: 'INR',
      value,
      num_items: Math.floor(value / 25) || 1,
    });
  },

  purchase: (amount, paymentId) => {
    if (!window.fbq) return;
    // Always a clean float — never string, never undefined
    const value = parseFloat(Number(amount).toFixed(2)) || 0;
    const eid = paymentId ? String(paymentId) : undefined;

    window.fbq('track', 'Purchase', {
      content_name: 'Annadana Seva',
      currency: 'INR',
      value,
      content_type: 'product',
      content_ids: eid ? [eid] : [],
      num_items: Math.floor(value / 25) || 1,
    }, eid ? { eventID: eid } : undefined);

    window.fbq('track', 'Donate', {
      content_name: 'Annadana Seva',
      currency: 'INR',
      value,
    }, eid ? { eventID: `donate_${eid}` } : undefined);
  },

  paymentAbandoned: (amount) => {
    if (!window.fbq) return;
    const value = parseFloat(Number(amount).toFixed(2)) || 0;
    window.fbq('trackCustom', 'PaymentAbandoned', {
      currency: 'INR',
      value,
    });
  },
};
