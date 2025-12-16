import React from "react";

export default function TermsPage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
            <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

            <div className="prose dark:prose-invert max-w-none space-y-8">
                <section>
                    <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                    <p>
                        By accessing and using PPT AI ("Service"), you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
                    <p>
                        PPT AI provides AI-powered presentation generation tools. We reserve the right to modify, suspend, or discontinue any part of the Service at any time.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
                    <p>
                        You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">4. Content and intellectual Property</h2>
                    <p>
                        You retain rights to the presentations you create. However, by using the Service, you grant us a license to process your content solely for the purpose of providing the Service.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">5. Limitation of Liability</h2>
                    <p>
                        PPT AI shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Service.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">6. Subscription and Billing</h2>
                    <p>
                        Subscription fees are billed in advance on a recurring basis. You may cancel your subscription at any time, but no refunds will be provided for the current billing period.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">7. Contact Us</h2>
                    <p>
                        If you have any questions about these Terms, please contact us at support@pptai.com.
                    </p>
                </section>
            </div>
        </div>
    );
}
