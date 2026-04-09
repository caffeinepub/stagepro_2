declare module "dodopayments-checkout" {
  export const DodoPayments: {
    Initialize(options: {
      mode: "live" | "test";
      displayType?: string;
      onEvent?: (event: { event_type: string; [key: string]: unknown }) => void;
    }): void;
    Checkout: {
      open(options: { checkoutUrl: string }): Promise<void>;
    };
  };
}
