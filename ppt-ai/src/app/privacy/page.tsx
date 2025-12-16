import React from "react";

export default function PrivacyPage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
            <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

            <div className="prose dark:prose-invert max-w-none space-y-8">
                <section>
                    <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
                    <p>
                        We collect information you provide directly to us, such as when you create an account, subscribe to our service, or request customer support. This may include your name, email address, and payment information.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
                    <p>
                        We use the information we collect to provide, maintain, and improve our Service, to process your transactions, and to communicate with you.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">3. Data Sharing</h2>
                    <p>
                        We do not sell your personal data. We may share your information with third-party service providers (such as payment processors like PayPal) who assist us in operating our Service.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
                    <p>
                        We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
                    <p>
                        Depending on your location, you may have rights regarding your personal data, including the right to access, correct, or delete the data we hold about you.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">6. Changes to This Policy</h2>
                    <p>
                        We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">7. Contact Us</h2>
                    <p>
                        If you have any questions about this Privacy Policy, please contact us at support@pptai.com.
                    </p>
                </section>
            </div>
        </div>
    );
}
