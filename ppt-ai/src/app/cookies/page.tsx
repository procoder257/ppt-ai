import { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
    title: "Cookie Policy | PPT AI",
    description: "Learn how PPT AI uses cookies and similar tracking technologies on pptai.online. Understand your choices and how to manage your cookie preferences.",
};

export default function CookiePolicyPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <main className="max-w-3xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-bold mb-4">Cookie Policy</h1>
                <p className="text-muted-foreground mb-12">Last updated: February 28, 2026</p>

                <div className="prose prose-lg dark:prose-invert max-w-none">
                    <p>
                        This Cookie Policy explains how PPT AI (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) uses cookies and similar tracking technologies when you visit pptai.online. It explains what these technologies are and why we use them, as well as your rights to control their use.
                    </p>

                    <h2>What are cookies?</h2>
                    <p>
                        Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners to make their websites work, or to work more efficiently, as well as to provide reporting information.
                    </p>
                    <p>
                        Cookies set by the website owner (in this case, PPT AI) are called &quot;first-party cookies.&quot; Cookies set by parties other than the website owner are called &quot;third-party cookies.&quot; Third-party cookies enable third-party features or functionality to be provided on or through the website (e.g., advertising, interactive content, and analytics).
                    </p>

                    <h2>Why do we use cookies?</h2>
                    <p>We use first- and third-party cookies for several reasons:</p>
                    <ul>
                        <li><strong>Essential cookies:</strong> These are strictly necessary for our website and services to function. They include cookies that authenticate users, maintain sessions, and ensure security.</li>
                        <li><strong>Analytics cookies:</strong> We use analytics tools (such as PostHog) to understand how visitors interact with our site — which pages are most popular, where users come from, and how they use the product. This helps us improve the experience.</li>
                        <li><strong>Preference cookies:</strong> These cookies remember your settings and choices (such as your preferred theme — light or dark mode) to provide a more personalized experience.</li>
                        <li><strong>Performance cookies:</strong> These cookies collect information about how you use our website to help us improve its performance and usability.</li>
                    </ul>

                    <h2>Specific cookies we use</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Cookie Name</th>
                                <th>Type</th>
                                <th>Purpose</th>
                                <th>Duration</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>next-auth.session-token</td>
                                <td>Essential</td>
                                <td>Maintains your authenticated session</td>
                                <td>Session / 30 days</td>
                            </tr>
                            <tr>
                                <td>next-auth.csrf-token</td>
                                <td>Essential</td>
                                <td>Protects against cross-site request forgery</td>
                                <td>Session</td>
                            </tr>
                            <tr>
                                <td>ph_*</td>
                                <td>Analytics</td>
                                <td>PostHog analytics — usage patterns and feature tracking</td>
                                <td>1 year</td>
                            </tr>
                            <tr>
                                <td>theme</td>
                                <td>Preference</td>
                                <td>Stores your light/dark mode preference</td>
                                <td>1 year</td>
                            </tr>
                        </tbody>
                    </table>

                    <h2>How to control cookies</h2>
                    <p>
                        You have the right to decide whether to accept or reject cookies. You can exercise your cookie preferences by modifying your browser settings. Most browsers allow you to:
                    </p>
                    <ul>
                        <li>See what cookies are set and delete them individually</li>
                        <li>Block third-party cookies</li>
                        <li>Block all cookies from specific websites</li>
                        <li>Block all cookies from being set</li>
                        <li>Delete all cookies when you close your browser</li>
                    </ul>
                    <p>
                        Please note that if you choose to block or delete cookies, some features of pptai.online may not function properly. Essential cookies cannot be disabled without affecting the core functionality of the service.
                    </p>
                    <p>
                        For more information on how to manage cookies in your browser, visit your browser&apos;s help documentation:
                    </p>
                    <ul>
                        <li>Google Chrome: Settings → Privacy and security → Cookies and other site data</li>
                        <li>Mozilla Firefox: Options → Privacy &amp; Security → Cookies and Site Data</li>
                        <li>Safari: Preferences → Privacy → Manage Website Data</li>
                        <li>Microsoft Edge: Settings → Cookies and site permissions</li>
                    </ul>

                    <h2>Do Not Track</h2>
                    <p>
                        Some browsers include a &quot;Do Not Track&quot; (DNT) feature that signals websites you visit that you do not want to have your online activity tracked. We currently do not respond to DNT signals, but we are committed to respecting your privacy choices as described in this policy.
                    </p>

                    <h2>Changes to this policy</h2>
                    <p>
                        We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our data practices. When we do, we will update the &quot;Last updated&quot; date at the top of this page. We encourage you to review this policy periodically.
                    </p>

                    <h2>Contact us</h2>
                    <p>
                        If you have questions about our use of cookies or this Cookie Policy, please review our <a href="/privacy">Privacy Policy</a> or contact us via the information provided there.
                    </p>
                </div>
            </main>
            <Footer />
        </div>
    );
}
