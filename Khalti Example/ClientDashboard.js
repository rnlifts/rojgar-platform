import { triggerKhaltiPayment } from "../KhaltiConfig"; // Adjust path if needed

import React from "react";

const KhaltiPaymentButton = () => {
  const handlePayment = () => {
    const amount = 1000;  // Example: Amount in NPR
    triggerKhaltiPayment(amount);  // Trigger Khalti payment widget
  };

  return (
    <div>
      <button
        className="bg-purple-500 text-white px-6 py-2 rounded-lg mt-4"
        onClick={handlePayment}
      >
        Pay with Khalti
      </button>
    </div>
  );
};

export default KhaltiPaymentButton;
