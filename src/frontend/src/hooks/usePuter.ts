// Dynamic Puter.js loader with pre-set auth to prevent popup entirely.
// Sets window.puter.env = 'app' and window.puter.authToken BEFORE the script loads,
// so Puter never enters its "needs authentication" flow.

import { useEffect, useRef, useState } from "react";

// Module-level guard to prevent double-loading across re-renders
let puterLoadState: "idle" | "loading" | "loaded" | "error" = "idle";
let puterLoadPromise: Promise<void> | null = null;
let domObserverStarted = false;

/**
 * MutationObserver that removes Puter-injected "Low Balance" / upgrade dialogs
 * from the DOM as soon as they appear.
 */
function suppressPuterDomUI() {
  if (domObserverStarted) return;
  domObserverStarted = true;

  const PUTER_SELECTORS = [
    '[class*="puter"]',
    '[id*="puter"]',
    'iframe[src*="puter.com"]',
    "[data-puter]",
  ];

  // Keywords that indicate this is a Puter balance/upgrade dialog
  const BALANCE_KEYWORDS = [
    "low balance",
    "not enough funding",
    "upgrade to continue",
    "upgrade now",
    "puter",
    "insufficient",
    "top up",
    "topup",
  ];

  function isPuterBalanceNode(node: Element): boolean {
    const text = (node.textContent || "").toLowerCase();
    return BALANCE_KEYWORDS.some((kw) => text.includes(kw));
  }

  function removePuterNodes() {
    // Remove any matching selector nodes
    for (const sel of PUTER_SELECTORS) {
      for (const el of document.querySelectorAll(sel)) {
        if (isPuterBalanceNode(el)) {
          (el as HTMLElement).style.display = "none";
          el.remove();
        }
      }
    }

    // Sweep fixed/absolute positioned overlays that contain Puter text
    const allBodyChildren = document.querySelectorAll(
      "body > div, body > section, body > aside, body > article",
    );
    for (const el of allBodyChildren) {
      const style = window.getComputedStyle(el);
      const isOverlay =
        style.position === "fixed" || style.position === "absolute";
      if (isOverlay && isPuterBalanceNode(el)) {
        (el as HTMLElement).style.display = "none";
        el.remove();
      }
    }

    // Catch any element with z-index > 9000 (typical for modals/popups)
    for (const el of document.querySelectorAll("body > *")) {
      const style = window.getComputedStyle(el);
      const zIndex = Number.parseInt(style.zIndex || "0", 10);
      if (zIndex > 9000 && isPuterBalanceNode(el)) {
        (el as HTMLElement).style.display = "none";
        el.remove();
      }
    }
  }

  // Run once immediately
  removePuterNodes();

  // Watch for DOM additions across the entire document
  const observer = new MutationObserver(() => {
    removePuterNodes();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

function blockPuterPopups() {
  // Block any window.open calls that go to puter.com
  const origOpen = window.open.bind(window);
  (window as any).open = (url: string, ...args: any[]) => {
    if (url && typeof url === "string" && url.includes("puter.com"))
      return null;
    return origOpen(url, ...args);
  };

  // Block postMessages from puter
  window.addEventListener(
    "message",
    (e) => {
      if (e.origin?.includes("puter.com")) e.stopImmediatePropagation();
    },
    true,
  );
}

function patchPuterAuth(token: string) {
  const puter = (window as any).puter;
  if (!puter) return;
  // Set token directly on the puter object
  puter.authToken = token;
  // Also set it on internal auth state if present
  if (puter.auth) {
    const noop = () => Promise.resolve(null);
    puter.auth.signIn = noop;
    puter.auth.signUp = noop;
    puter.auth.showDialog = noop;
    puter.auth.isSignedIn = () => true;
    puter.auth.getToken = () => Promise.resolve(token);
  }
  // Patch internal state fields Puter checks
  if (typeof puter._is_authenticated !== "undefined") {
    puter._is_authenticated = true;
  }
  if (typeof puter._token !== "undefined") {
    puter._token = token;
  }

  // Suppress Puter's built-in "Low Balance" dialog UI completely
  if (puter.ui) {
    const silentNoop = () => Promise.resolve(null);
    puter.ui.alert = silentNoop;
    puter.ui.confirm = silentNoop;
    puter.ui.showDialog = silentNoop;
    puter.ui.showError = silentNoop;
    puter.ui.notify = silentNoop;
    puter.ui.show = silentNoop;
  }
  if (puter.dialog) {
    const silentNoop = () => Promise.resolve(null);
    puter.dialog.alert = silentNoop;
    puter.dialog.show = silentNoop;
    puter.dialog.confirm = silentNoop;
    puter.dialog.error = silentNoop;
  }
  // Patch notification system
  if (puter.notification) {
    const silentNoop = () => Promise.resolve(null);
    puter.notification.show = silentNoop;
    puter.notification.error = silentNoop;
  }
  // Patch any top-level alert-like methods
  if (typeof puter.alert === "function") {
    puter.alert = () => Promise.resolve(null);
  }
  if (typeof puter.notify === "function") {
    puter.notify = () => Promise.resolve(null);
  }
}

function loadPuterScript(token: string): Promise<void> {
  if (puterLoadPromise) return puterLoadPromise;

  puterLoadState = "loading";
  puterLoadPromise = new Promise<void>((resolve, reject) => {
    // CRITICAL: Pre-configure window.puter BEFORE the script tag is injected
    (window as any).puter = (window as any).puter || {};
    (window as any).puter.env = "app";
    (window as any).puter.appID = "stagepro-app";
    (window as any).puter.__puter_no_auth__ = true;
    (window as any).puter.authToken = token;

    // Block popups and suppress DOM UI before Puter loads
    blockPuterPopups();
    suppressPuterDomUI();

    const script = document.createElement("script");
    script.src = "https://js.puter.com/v2/";
    script.async = true;

    script.onload = () => {
      // Patch auth immediately after script loads
      patchPuterAuth(token);
      puterLoadState = "loaded";

      // Keep patching for 60 seconds to handle any delayed re-auth attempts
      let patchCount = 0;
      const patchInterval = setInterval(() => {
        patchPuterAuth(token);
        patchCount++;
        if (patchCount >= 240) clearInterval(patchInterval); // 60s at 250ms
      }, 250);

      resolve();
    };

    script.onerror = (err) => {
      puterLoadState = "error";
      puterLoadPromise = null;
      reject(err);
    };

    document.head.appendChild(script);
  });

  return puterLoadPromise;
}

export function usePuter(actor: any): { puter: any; isReady: boolean } {
  const [isReady, setIsReady] = useState(false);
  const [puterInstance, setPuterInstance] = useState<any>(null);
  const initStartedRef = useRef(false);

  useEffect(() => {
    if (!actor) return;
    if (initStartedRef.current) return;
    initStartedRef.current = true;

    const init = async () => {
      if (puterLoadState === "loaded" && (window as any).puter?.ai) {
        setPuterInstance((window as any).puter);
        setIsReady(true);
        return;
      }

      let token: string | null = null;
      try {
        token = await (actor as any).getPuterToken();
      } catch (err) {
        console.error(
          "[usePuter] Failed to fetch Puter token from backend:",
          err,
        );
      }

      if (!token) {
        console.warn("[usePuter] No Puter token available — AI calls may fail");
        token = "";
      }

      try {
        await loadPuterScript(token);
        const puter = (window as any).puter;
        if (puter) {
          setPuterInstance(puter);
          setIsReady(true);
        }
      } catch (err) {
        console.error("[usePuter] Failed to load Puter.js script:", err);
      }
    };

    init();
  }, [actor]);

  return { puter: puterInstance, isReady };
}

/**
 * Helper to check if a Puter error is a balance/funding issue.
 * Call this in catch blocks to provide a friendly message.
 */
export function isPuterBalanceError(err: unknown): boolean {
  const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
  return (
    msg.includes("low balance") ||
    msg.includes("not enough funding") ||
    msg.includes("insufficient") ||
    msg.includes("credits") ||
    msg.includes("upgrade")
  );
}
