export const initiateSTKPush = async (phoneNumber: string, amount: number): Promise<{ success: boolean; message: string }> => {
  // Simulating network delay for realistic "secure" feel
  return new Promise((resolve) => {
    console.log(`Initiating STK Push to ${phoneNumber} for KES ${amount}...`);
    
const API_BASE = import.meta.env.VITE_API_BASE || 
  (import.meta.env.MODE === 'production' 
    ? "https://faith-blst.onrender.com/api" 
    : "http://localhost:5000/api");

export const initiateSTKPush = async (phoneNumber: string, amount: number): Promise<{ success: boolean; message: string }> => {
  try {
    const token = localStorage.getItem('faith_token');
    
    console.log(`Initiating REAL STK Push to ${phoneNumber} for KES ${amount}...`);
    
    const res = await fetch(`${API_BASE}/mpesa/stkpush`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ phone: phoneNumber, amount })
    });
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("M-Pesa Integration Error:", error);
    return { success: false, message: "System sync error. Failed to connect to Safaricom Daraja API." };
  }
};
