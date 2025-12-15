export type PayPalPlan = {
  id: string;
  name: string;
  description?: string;
  status: "ACTIVE" | "INACTIVE" | "CREATED";
  billingCycles: PayPalBillingCycle[];
};

export type PayPalBillingCycle = {
  frequency: {
    intervalUnit: "MONTH" | "YEAR";
    intervalCount: number;
  };
  tenureType: "REGULAR" | "TRIAL";
  sequence: number;
  totalCycles?: number;
  pricingScheme: {
    fixedPrice: {
      value: string;
      currencyCode: string;
    };
  };
};

export type PayPalSubscription = {
  id: string;
  status:
    | "APPROVAL_PENDING"
    | "APPROVED"
    | "ACTIVE"
    | "SUSPENDED"
    | "CANCELLED"
    | "EXPIRED";
  planId: string;
  subscriber: {
    payerId?: string;
    emailAddress?: string;
  };
  billingInfo?: {
    outstandingBalance: {
      value: string;
      currencyCode: string;
    };
    cycleExecutions: Array<{
      tenureType: string;
      sequence: number;
      cyclesCompleted: number;
      cyclesRemaining?: number;
    }>;
    lastPayment?: {
      amount: {
        value: string;
        currencyCode: string;
      };
      time: string;
    };
    nextBillingTime?: string;
  };
  createTime: string;
  updateTime: string;
};

export type PayPalWebhookEvent = {
  id: string;
  eventType: string;
  resourceType: string;
  summary: string;
  resource: Record<string, unknown>;
  createTime: string;
};
