import React, { useState } from 'react';

const KhaltiTestComponent = () => {
  const [amount, setAmount] = useState(1000); // 1000 paisa = Rs 10

  const handlePay = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/khalti/initiate-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount, // using the state variable
          purchaseOrderId: 'test-123',
          purchaseOrderName: 'Test Payment'
        })
      });
      const data = await response.json();
      if (data.payment_url) {
        // Redirect to Khalti payment page
        window.location.href = data.payment_url;
      } else {
        console.error("No payment_url returned:", data);
        alert("Failed to initiate payment");
      }
    } catch (error) {
      console.error("Error initiating payment:", error);
      alert("Error initiating payment");
    }
  };

  return (
    <div>
      <h2>Pay with Khalti Sandbox</h2>
      <div>
        <label>
          Amount (paisa):
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </label>
      </div>
      <button onClick={handlePay}>Pay Now</button>
    </div>
  );
};

export default KhaltiTestComponent;
