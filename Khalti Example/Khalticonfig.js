import KhaltiCheckout from "khalti-checkout-web";

const config = {
  publicKey: "YOUR_PUBLIC_KEY",  // Replace with your Khalti Public Key
  productIdentity: "1234567890",
  productName: "Freelance Job Payment",
  productUrl: "http://localhost:3000",
  eventHandler: {
    onSuccess(payload) {
      // Payment successful
      console.log("Payment Success:", payload);
      alert("Payment Successful!");
      // You can send the payload to your backend to verify and store the transaction
    },
    onError(error) {
      // Payment failed
      console.error("Payment Error:", error);
      alert("Payment Failed!");
    },
    onClose() {
      console.log("Khalti widget closed.");
    },
  },
  paymentPreference: [
    "KHALTI",
    "EBANKING",
    "MOBILE_BANKING",
    "CONNECT_IPS",
    "SCT",
  ],
};

const khaltiCheckout = new KhaltiCheckout(config);

export const triggerKhaltiPayment = (amount) => {
  khaltiCheckout.show({ amount: amount * 100 });  // Convert to paisa
};
