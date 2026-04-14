export const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (document.getElementById("rzp-script")) return resolve(true);
    const s = document.createElement("script");
    s.id = "rzp-script";
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

export const openRazorpayCheckout = async ({ orderId, amount, keyId, name, email, description, onSuccess, onCancel }) => {
  const ok = await loadRazorpayScript();
  if (!ok) { alert("Failed to load payment SDK"); return; }

  const rzp = new window.Razorpay({
    key: keyId,
    amount,
    currency: "INR",
    name: "B2World LMS",
    description,
    order_id: orderId,
    prefill: { name, email },
    theme: { color: "#111827" },
    handler: onSuccess,
    modal: { ondismiss: onCancel },
  });

  rzp.open();
};