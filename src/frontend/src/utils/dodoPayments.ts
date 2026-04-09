// Dodo Payments integration
const DODO_API_KEY =
  "diitWzQsLSG_nMno.WzY7HqxaymOz3VNTogFw6EGl-i4FYX-1SKrA87O1pPj_gPN5";
const DODO_BASE_URL = "https://live.dodopayments.com";

export interface DodoCheckoutSessionResult {
  session_id: string;
  checkout_url: string;
}

/**
 * Creates a Dodo Payments checkout session for the given product.
 * Returns the checkout URL to open in the overlay.
 */
export async function createDodoCheckoutSession(
  productId: string,
  planId: string,
): Promise<DodoCheckoutSessionResult> {
  const successUrl = `${window.location.origin}${window.location.pathname}?payment=success&plan=${planId}`;
  const cancelUrl = `${window.location.origin}${window.location.pathname}?payment=cancelled`;

  const res = await fetch(`${DODO_BASE_URL}/checkouts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DODO_API_KEY}`,
    },
    body: JSON.stringify({
      product_cart: [{ product_id: productId, quantity: 1 }],
      return_url: successUrl,
      cancel_url: cancelUrl,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Dodo Payments API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  if (!data.checkout_url) {
    throw new Error("Dodo Payments did not return a checkout URL");
  }

  return {
    session_id: data.session_id,
    checkout_url: data.checkout_url,
  };
}
