import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
    Button,
} from "@react-email/components";
import * as React from "react";

interface SubscriptionSuccessEmailProps {
    name?: string;
    planName: string;
    price: string;
}

export const SubscriptionSuccessEmail = ({
    name = "Customer",
    planName = "Pro",
    price = "$19.00",
}: SubscriptionSuccessEmailProps) => (
    <Html>
        <Head />
        <Preview>Your PPT AI subscription is now active!</Preview>
        <Body style={main}>
            <Container style={container}>
                <Heading style={h1}>Subscription Activated! 🎉</Heading>
                <Text style={text}>Hi {name},</Text>
                <Text style={text}>
                    Thank you for subscribing to the <strong>{planName}</strong> plan.
                    Your account has been upgraded and you now have full access to all premium features.
                </Text>

                <Section style={summary}>
                    <Text style={summaryTitle}>Order Summary</Text>
                    <Text style={summaryRow}>
                        <span>Plan:</span> <strong>{planName}</strong>
                    </Text>
                    <Text style={summaryRow}>
                        <span>Amount:</span> <strong>{price}</strong>
                    </Text>
                </Section>

                <Section style={btnContainer}>
                    <Button style={button} href="https://pptai.com/dashboard">
                        Go to Dashboard
                    </Button>
                </Section>

                <Text style={footer}>
                    &copy; {new Date().getFullYear()} PPT AI. All rights reserved.
                </Text>
            </Container>
        </Body>
    </Html>
);

export default SubscriptionSuccessEmail;

const main = {
    backgroundColor: "#ffffff",
    fontFamily:
        "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen-Sans,Ubuntu,Cantarell,'Helvetica Neue',sans-serif",
};

const container = {
    margin: "0 auto",
    padding: "20px 0 48px",
};

const h1 = {
    color: "#333",
    fontSize: "24px",
    fontWeight: "bold",
    textAlign: "center" as const,
    margin: "40px 0",
};

const text = {
    color: "#333",
    fontSize: "16px",
    lineHeight: "26px",
};

const summary = {
    backgroundColor: "#f9f9f9",
    padding: "20px",
    borderRadius: "8px",
    margin: "20px 0",
};

const summaryTitle = {
    fontWeight: "bold",
    fontSize: "18px",
    marginBottom: "10px",
    color: "#000",
};

const summaryRow = {
    display: "flex",
    justifyContent: "space-between",
    margin: "5px 0",
    fontSize: "16px",
    color: "#555",
};

const btnContainer = {
    textAlign: "center" as const,
    margin: "30px 0",
};

const button = {
    backgroundColor: "#000",
    borderRadius: "5px",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "bold",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "inline-block",
    padding: "12px 24px",
};

const footer = {
    color: "#898989",
    fontSize: "12px",
    marginTop: "24px",
    textAlign: "center" as const,
};
