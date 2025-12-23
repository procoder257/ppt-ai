"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface ContactSalesModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ContactSalesModal({ open, onOpenChange }: ContactSalesModalProps) {
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        companyName: "",
        employeeCount: "",
        revenueRange: "",
        role: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/contact/sales", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setSubmitted(true);
            } else {
                alert("Something went wrong. Please try again.");
            }
        } catch (error) {
            console.error(error);
            alert("Failed to submit form.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                {submitted ? (
                    <div className="text-center py-6 space-y-4">
                        <div className="text-green-500 text-5xl mb-4">✓</div>
                        <DialogHeader>
                            <DialogTitle className="text-center">Thank you!</DialogTitle>
                            <DialogDescription className="text-center">
                                We&apos;ve received your details and will be in touch shortly.
                            </DialogDescription>
                        </DialogHeader>
                        <Button onClick={() => onOpenChange(false)} className="mt-4">
                            Close
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>Contact Sales</DialogTitle>
                            <DialogDescription>
                                Tell us about your organization and we&apos;ll help you find the right plan.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    required
                                    value={formData.name}
                                    onChange={(e) => handleChange("name", e.target.value)}
                                    placeholder="John Doe"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="companyName">Company Name</Label>
                                <Input
                                    id="companyName"
                                    required
                                    value={formData.companyName}
                                    onChange={(e) => handleChange("companyName", e.target.value)}
                                    placeholder="Acme Corp"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="employees">Employees</Label>
                                    <Input
                                        id="employees"
                                        required
                                        type="number"
                                        value={formData.employeeCount}
                                        onChange={(e) => handleChange("employeeCount", e.target.value)}
                                        placeholder="100"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="revenue">Revenue Range</Label>
                                    <Select
                                        value={formData.revenueRange}
                                        onValueChange={(val) => handleChange("revenueRange", val)}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="<1M">&lt; $1M</SelectItem>
                                            <SelectItem value="1-10M">$1M - $10M</SelectItem>
                                            <SelectItem value="10M+">$10M+</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="role">Role</Label>
                                <Input
                                    id="role"
                                    required
                                    value={formData.role}
                                    onChange={(e) => handleChange("role", e.target.value)}
                                    placeholder="CTO, Manager, etc."
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Submit
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
