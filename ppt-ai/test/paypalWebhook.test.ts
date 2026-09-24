import { describe, expect, it, vi } from "vitest";
import {
  buildVerificationBody,
  extractBillingAgreementId,
  extractPaymentAmount,
  verifyPayPalWebhook,
} from "@/server/paypal/webhook";

function signedHeaders() {
  return new Headers({
    "paypal-auth-algo": "SHA256withRSA",
    "paypal-cert-url": "https://api.paypal.com/v1/notifications/certs/CERT",
    "paypal-transmission-id": "tx-1",
    "paypal-transmission-sig": "sig",
    "paypal-transmission-time": "2026-09-24T00:00:00Z",
  });
}

const rawBody = '{"id":"WH-1","event_type":"PAYMENT.SALE.COMPLETED","resource":{"amount":{"total":"19.00"}}}';

describe("buildVerificationBody", () => {
  it("embeds the raw body verbatim and includes the webhook id", () => {
    const body = buildVerificationBody(signedHeaders(), rawBody, "WH-ID");
    expect(body).not.toBeNull();
    expect(body).toContain(`"webhook_event":${rawBody}`);
    const parsed = JSON.parse(body as string);
    expect(parsed.webhook_id).toBe("WH-ID");
    expect(parsed.transmission_id).toBe("tx-1");
  });

  it("returns null when a signature header is missing", () => {
    const headers = signedHeaders();
    headers.delete("paypal-transmission-sig");
    expect(buildVerificationBody(headers, rawBody, "WH-ID")).toBeNull();
  });
});

describe("verifyPayPalWebhook", () => {
  const base = {
    rawBody,
    baseUrl: "https://api.sandbox.paypal.com",
    getAccessToken: async () => "token",
  };

  it("fails closed when PAYPAL_WEBHOOK_ID is not configured", async () => {
    const fetchImpl = vi.fn();
    vi.spyOn(console, "error").mockImplementation(() => {});
    const ok = await verifyPayPalWebhook({ ...base, headers: signedHeaders(), webhookId: undefined, fetchImpl });
    expect(ok).toBe(false);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("rejects unsigned requests without calling PayPal", async () => {
    const fetchImpl = vi.fn();
    const ok = await verifyPayPalWebhook({ ...base, headers: new Headers(), webhookId: "WH-ID", fetchImpl });
    expect(ok).toBe(false);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("accepts only verification_status SUCCESS", async () => {
    const success = vi.fn().mockResolvedValue(new Response(JSON.stringify({ verification_status: "SUCCESS" })));
    const failure = vi.fn().mockResolvedValue(new Response(JSON.stringify({ verification_status: "FAILURE" })));

    expect(await verifyPayPalWebhook({ ...base, headers: signedHeaders(), webhookId: "WH-ID", fetchImpl: success })).toBe(true);
    expect(await verifyPayPalWebhook({ ...base, headers: signedHeaders(), webhookId: "WH-ID", fetchImpl: failure })).toBe(false);

    const [url, init] = success.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.sandbox.paypal.com/v1/notifications/verify-webhook-signature");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer token");
  });

  it("fails closed on network errors and non-2xx responses", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const throws = vi.fn().mockRejectedValue(new Error("network"));
    const serverError = vi.fn().mockResolvedValue(new Response("oops", { status: 500 }));
    expect(await verifyPayPalWebhook({ ...base, headers: signedHeaders(), webhookId: "WH-ID", fetchImpl: throws })).toBe(false);
    expect(await verifyPayPalWebhook({ ...base, headers: signedHeaders(), webhookId: "WH-ID", fetchImpl: serverError })).toBe(false);
  });
});

describe("extractPaymentAmount", () => {
  it("reads v1 sale amounts", () => {
    expect(extractPaymentAmount({ amount: { total: "19.00", currency: "USD" } })).toEqual({ amount: 19, currency: "usd" });
  });

  it("reads v2 capture amounts", () => {
    expect(extractPaymentAmount({ amount: { value: "190.50", currency_code: "EUR" } })).toEqual({ amount: 190.5, currency: "eur" });
  });

  it("falls back to 0/usd when the amount is missing or malformed", () => {
    expect(extractPaymentAmount({})).toEqual({ amount: 0, currency: "usd" });
    expect(extractPaymentAmount({ amount: { total: "abc" } })).toEqual({ amount: 0, currency: "usd" });
  });
});

describe("extractBillingAgreementId", () => {
  it("returns the id only when it is a non-empty string", () => {
    expect(extractBillingAgreementId({ billing_agreement_id: "I-123" })).toBe("I-123");
    expect(extractBillingAgreementId({ billing_agreement_id: "" })).toBeUndefined();
    expect(extractBillingAgreementId({})).toBeUndefined();
  });
});
