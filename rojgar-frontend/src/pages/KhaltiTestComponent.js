import KhaltiCheckout from "khalti-checkout-web";
import React from "react";

const KhaltiTestComponent = () => {
  const handleKhaltiPayment = () => {
    const config = {
      publicKey: "657417f59d744c999baeda84816000c6", // Replace with your public key (starts with "test_public_key_")
      productIdentity: "order_123", // Unique ID for your purchase
      productName: "Test Purchase", // Product or service name
      productUrl: "http://localhost:3000/", // URL of your website
      eventHandler: {
        onSuccess(payload) {
          alert("Payment Successful!");
          console.log("Payment Payload:", payload); // You can handle post-payment logic here
        },
        onError(error) {
          alert("Payment Failed!");
          console.error("Payment Error:", error); // Handle error cases here
        },
        onClose() {
          console.log("Khalti Widget Closed.");
        },
      },
      paymentPreference: ["KHALTI", "EBANKING", "MOBILE_BANKING", "CONNECT_IPS", "SCT"], // Payment options
    };

    const khaltiCheckout = new KhaltiCheckout(config);
    khaltiCheckout.show({ amount: 50000 }); // Amount in paisa (i.e., 50000 = Rs. 500)
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Test Khalti Integration</h2>
      <button
        onClick={handleKhaltiPayment}
        style={{
          padding: "10px 20px",
          backgroundColor: "#5d2e8e",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Load Money
      </button>
    </div>
  );
};

export default KhaltiTestComponent;
