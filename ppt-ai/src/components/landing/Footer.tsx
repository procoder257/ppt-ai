"use client";

import Link from "next/link";
import { Twitter, Linkedin, Github } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-muted/10 border-t pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                                <span className="text-white font-bold text-xs">P</span>
                            </div>
                            <span className="font-bold text-lg">PPT AI</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                            AI-powered presentation builder for modern professionals.
                        </p>
                        <div className="flex gap-4 text-muted-foreground">
                            <Link href="#" className="hover:text-primary transition-colors">
                                <Twitter className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="hover:text-primary transition-colors">
                                <Linkedin className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="hover:text-primary transition-colors">
                                <Github className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Product</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/#features" className="hover:text-foreground">Features</Link></li>
                            <li><Link href="/pricing" className="hover:text-foreground">Pricing</Link></li>
                            <li><Link href="/use-cases" className="hover:text-foreground">Use Cases</Link></li>
                            <li><Link href="/blog" className="hover:text-foreground">Blog</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Company</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/about" className="hover:text-foreground">About</Link></li>
                            <li><Link href="/blog" className="hover:text-foreground">Blog</Link></li>
                            <li><Link href="/use-cases" className="hover:text-foreground">Use Cases</Link></li>
                            <li><Link href="/pricing" className="hover:text-foreground">Pricing</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Legal</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-foreground">Terms of Service</Link></li>
                            <li><Link href="/cookies" className="hover:text-foreground">Cookie Policy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t text-center text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} PPT AI. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
