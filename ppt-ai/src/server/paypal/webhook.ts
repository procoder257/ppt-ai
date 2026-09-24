/**
 * PayPal webhook helpers: signature verification and payload normalisation.
 * See https://developer.paypal.com/api/rest/webhooks/rest/#link-verifysignature
 */

export const PAYPAL_SIGNATURE_HEADERS = {
  authAlgo: "paypal-auth-algo",
  certUrl: "paypal-cert-url",
  transmissionId: "paypal-transmission-id",
  transmissionSig: "paypal-transmission-sig",
  transmissionTime: "paypal-transmission-time",
} as const;

export interface PayPalWebhookEvent {
  id?: string;
  event_type: string;
  resource: Record<string, unknown> & { id?: string };
}

/**
 * Builds the body for PayPal's verify-webhook-signature call.
 * The raw event body is embedded verbatim: re-serialising parsed JSON can
 * change key order / number formatting and break the signature check.
 * Returns null if any required header is missing.
 */
export function buildVerificationBody(
  headers: Headers,
  rawBody: string,
  webhookId: string,
): string | null {
  const values: Record<keyof typeof PAYPAL_SIGNATURE_HEADERS, string | null> = {
    authAlgo: headers.get(PAYPAL_SIGNATURE_HEADERS.authAlgo),
    certUrl: headers.get(PAYPAL_SIGNATURE_HEADERS.certUrl),
    transmissionId: headers.get(PAYPAL_SIGNATURE_HEADERS.transmissionId),
    transmissionSig: headers.get(PAYPAL_SIGNATURE_HEADERS.transmissionSig),
    transmissionTime: headers.get(PAYPAL_SIGNATURE_HEADERS.transmissionTime),
  };
  if (Object.values(values).some((v) => !v)) return null;

  return `{"auth_algo":${JSON.stringify(values.authAlgo)},"cert_url":${JSON.stringify(values.certUrl)},"transmission_id":${JSON.stringify(values.transmissionId)},"transmission_sig":${JSON.stringify(values.transmissionSig)},"transmission_time":${JSON.stringify(values.transmissionTime)},"webhook_id":${JSON.stringify(webhookId)},"webhook_event":${rawBody}}`;
}

/**
 * Verifies a webhook with PayPal. Fails closed on any error.
 */
export async function verifyPayPalWebhook(opts: {
  headers: Headers;
  rawBody: string;
  webhookId: string | undefined;
  baseUrl: string;
  getAccessToken: () => Promise<string>;
  fetchImpl?: typeof fetch;
}): Promise<boolean> {
  const { headers, rawBody, webhookId, baseUrl, getAccessToken } = opts;
  const fetchImpl = opts.fetchImpl ?? fetch;

  if (!webhookId) {
    console.error("[PayPal webhook] PAYPAL_WEBHOOK_ID is not set; rejecting event");
    return false;
  }

  const body = buildVerificationBody(headers, rawBody, webhookId);
  if (!body) return false;

  try {
    const accessToken = await getAccessToken();
    const response = await fetchImpl(
      `${baseUrl}/v1/notifications/verify-webhook-signature`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body,
      },
    );
    if (!response.ok) {
      console.error("[PayPal webhook] verification request failed:", response.status);
      return false;
    }
    const data = (await response.json()) as { verification_status?: string };
    return data.verification_status === "SUCCESS";
  } catch (error) {
    console.error("[PayPal webhook] verification error:", error);
    return false;
  }
}

/**
 * Extracts amount/currency from PAYMENT.SALE.* (v1: amount.total/currency)
 * and PAYMENT.CAPTURE.* (v2: amount.value/currency_code) resources.
 */
export function extractPaymentAmount(
  resource: Record<string, unknown>,
): { amount: number; currency: string } {
  const amount = (resource.amount ?? {}) as {
    total?: string;
    value?: string;
    currency?: string;
    currency_code?: string;
  };
  const raw = amount.value ?? amount.total ?? "0";
  const parsed = Number.parseFloat(raw);
  return {
    amount: Number.isFinite(parsed) ? parsed : 0,
    currency: (amount.currency_code ?? amount.currency ?? "usd").toLowerCase(),
  };
}

/** The subscription a payment belongs to, if PayPal included it. */
export function extractBillingAgreementId(
  resource: Record<string, unknown>,
): string | undefined {
  const id = resource.billing_agreement_id;
  return typeof id === "string" && id.length > 0 ? id : undefined;
}
