// Dodo Payments integration — direct URL redirect approach
// The primary checkout method opens the Dodo hosted checkout URL directly.
// No SDK or API session creation needed — Dodo pre-generates checkout URLs per product.

export const DODO_API_KEY =
  "diitWzQsLSG_nMno.WzY7HqxaymOz3VNTogFw6EGl-i4FYX-1SKrA87O1pPj_gPN5";

export interface DodoPlan {
  id: string;
  checkoutUrl: string;
}

/**
 * Opens the Dodo checkout URL in the current tab.
 * Appends return/cancel redirect params if the URL supports query strings.
 */
export function openDodoCheckout(plan: DodoPlan): void {
  const successUrl = `${window.location.origin}${window.location.pathname}?payment=success&plan=${plan.id}`;
  const cancelUrl = `${window.location.origin}${window.location.pathname}?payment=cancelled`;

  let url = plan.checkoutUrl;
  try {
    const parsed = new URL(url);
    parsed.searchParams.set("redirect_url", successUrl);
    parsed.searchParams.set("cancel_url", cancelUrl);
    url = parsed.toString();
  } catch {
    // If URL parsing fails, use the original URL as-is
  }

  window.location.href = url;
}

/**
 * Legacy helper — creates a checkout session via the Dodo API.
 * Only needed if you want to dynamically generate checkout URLs server-side.
 * The main flow uses openDodoCheckout() instead.
 */
export async function createDodoCheckoutSession(
  productId: string,
  planId: string,
): Promise<{ session_id: string; checkout_url: string }> {
  const DODO_BASE_URL = "https://live.dodopayments.com";
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
