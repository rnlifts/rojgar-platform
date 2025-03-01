import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const pidx = queryParams.get('pidx');
  const status = queryParams.get('status');
  const transactionId = queryParams.get('transaction_id');

  useEffect(() => {
    // Log payment details
    console.log('Payment status:', status);
    console.log('Payment pidx:', pidx);
    console.log('Transaction ID:', transactionId);

    // You can make an API call here to verify the payment on your backend
    // Example:
    // const verifyPayment = async () => {
    //   try {
    //     const response = await fetch('/api/verify-payment', {
    //       method: 'POST',
    //       headers: { 'Content-Type': 'application/json' },
    //       body: JSON.stringify({ pidx, status, transactionId })
    //     });
    //     const data = await response.json();
    //     if (!data.success) {
    //       throw new Error('Payment verification failed');
    //     }
    //   } catch (error) {
    //     console.error('Error verifying payment:', error);
    //     navigate('/payment-failed');
    //   }
    // };
    // verifyPayment();
  }, [pidx, status, transactionId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h2>

          {/* Transaction Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="text-left space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium text-green-600">{status}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Payment ID:</span>
                <span className="font-medium">{pidx}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-medium">{transactionId}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => window.print()}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors"
            >
              Print Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;