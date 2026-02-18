export const initiateSTKPush = async (phoneNumber: string, amount: number): Promise<{ success: boolean; message: string }> => {
  // Simulating network delay for realistic "secure" feel
  return new Promise((resolve) => {
    console.log(`Initiating STK Push to ${phoneNumber} for KES ${amount}...`);
    setTimeout(() => {
      // 95% success rate for simulation reliability
      const isSuccessful = Math.random() > 0.05;
      if (isSuccessful) {
        resolve({ success: true, message: "Payment successful. Thank you for shopping with Faith Shop!" });
      } else {
        resolve({ success: false, message: "Payment declined by M-Pesa. Please verify your balance." });
      }
    }, 2500); // Faster feedback than before
  });
};