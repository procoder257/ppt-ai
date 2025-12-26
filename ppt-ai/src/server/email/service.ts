import { resend, EMAIL_SENDER } from "./client";
import { WelcomeEmail } from "./templates/WelcomeEmail";
import { SubscriptionSuccessEmail } from "./templates/SubscriptionSuccessEmail";

/**
 * Service to handle email notifications.
 */
export const EmailService = {
    /**
     * Send a welcome email to a new user.
     */
    async sendWelcomeEmail(email: string, name?: string) {
        try {
            const { data, error } = await resend.emails.send({
                from: EMAIL_SENDER,
                to: email,
                subject: "Welcome to PPT AI! 🚀",
                react: WelcomeEmail({ name }),
            });

            if (error) {
                console.error("[EmailService] Error sending welcome email:", error);
                return { success: false, error };
            }
            return { success: true, data };
        } catch (err) {
            console.error("[EmailService] Unexpected error sending welcome email:", err);
            return { success: false, error: err };
        }
    },

    /**
     * Send a subscription success email.
     */
    async sendSubscriptionSuccess(email: string, name: string, planName: string, price: string) {
        try {
            const { data, error } = await resend.emails.send({
                from: EMAIL_SENDER,
                to: email,
                subject: "Subscription Activated! 🎉",
                react: SubscriptionSuccessEmail({ name, planName, price }),
            });

            if (error) {
                console.error("[EmailService] Error sending subscription email:", error);
                return { success: false, error };
            }
            return { success: true, data };
        } catch (err) {
            console.error("[EmailService] Unexpected error sending subscription email:", err);
            return { success: false, error: err };
        }
    },
};
