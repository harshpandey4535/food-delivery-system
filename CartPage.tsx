import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiClient } from "../services/api";
import { useFoodApp } from "../context/AppContext";
import { PaymentVerificationPayload } from "../types";

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function CartPage() {
  const navigate = useNavigate();
  const { cart, changeCartQuantity, removeFromCart, placeOrder, user } = useFoodApp();
  const [processing, setProcessing] = useState(false);

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const deliveryFee = subtotal > 0 ? 30 : 0;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + deliveryFee + tax;

  const checkout = async () => {
    if (cart.length === 0) return;

    setProcessing(true);
    const loaded = await loadRazorpayScript();

    if (!loaded || !window.Razorpay) {
      await placeOrder({ paymentStatus: "captured", paymentId: "local_demo_payment" });
      navigate("/dashboard");
      setProcessing(false);
      return;
    }

    try {
      const order = await apiClient.createRazorpayOrder(total * 100);
      const key = import.meta.env.VITE_RAZORPAY_KEY_ID ?? "rzp_test_demo_key";

      const options = {
        key,
        amount: order.amount,
        currency: order.currency,
        name: "MealLane",
        description: "Food delivery order",
        order_id: order.id,
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: {
          color: "#0f172a",
        },
        handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
          const payload: PaymentVerificationPayload = {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          };

          try {
            await apiClient.verifyPayment(payload);
          } finally {
            await placeOrder({ paymentId: response.razorpay_payment_id, paymentStatus: "captured", razorpayOrderId: response.razorpay_order_id });
            navigate("/dashboard");
          }
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch {
      await placeOrder({ paymentId: "local_demo_payment", paymentStatus: "captured" });
      navigate("/dashboard");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="app-panel p-6 sm:p-8">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Cart</h1>
        <p className="mt-2 text-sm text-slate-500">Review items, adjust quantities, and complete payment with Razorpay test mode.</p>
      </section>

      {cart.length === 0 ? (
        <section className="app-panel p-8 text-center">
          <h2 className="text-2xl font-semibold text-slate-950">Your cart is empty</h2>
          <p className="mt-2 text-sm text-slate-500">Browse restaurants and add meals to continue.</p>
          <Link to="/" className="mt-6 inline-flex app-button">
            Browse restaurants
          </Link>
        </section>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-4">
            {cart.map((item) => (
              <article key={`${item.restaurantId}:${item.id}`} className="rounded-3xl border border-slate-200 bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-950">{item.name}</h3>
                    <p className="text-sm text-slate-500">{item.restaurantName}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">Rs {item.price}</span>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <button type="button" onClick={() => changeCartQuantity(item.id, item.quantity - 1)} className="app-button-secondary px-3 py-2">
                    -
                  </button>
                  <span className="min-w-10 text-center text-sm font-semibold text-slate-900">{item.quantity}</span>
                  <button type="button" onClick={() => changeCartQuantity(item.id, item.quantity + 1)} className="app-button-secondary px-3 py-2">
                    +
                  </button>
                  <button type="button" onClick={() => removeFromCart(item.id)} className="ml-auto app-link">
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </section>

          <aside className="app-panel h-fit p-6">
            <h2 className="text-xl font-semibold text-slate-950">Order summary</h2>
            <div className="mt-5 space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>Rs {subtotal}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Delivery fee</span>
                <span>Rs {deliveryFee}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Tax</span>
                <span>Rs {tax}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base font-semibold text-slate-950">
                <span>Total</span>
                <span>Rs {total}</span>
              </div>
            </div>

            <button type="button" onClick={checkout} disabled={processing} className="app-button mt-6 w-full">
              {processing ? "Processing..." : "Pay with Razorpay"}
            </button>

            <p className="mt-3 text-xs leading-5 text-slate-500">
              Test mode note: set VITE_RAZORPAY_KEY_ID in the frontend and RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET in the backend.
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
