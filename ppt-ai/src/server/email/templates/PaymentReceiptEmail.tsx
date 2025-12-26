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
    Hr,
} from "@react-email/components";
import * as React from "react";

interface PaymentReceiptEmailProps {
    name?: string;
    orderId: string;
    amount: string;
    date: string;
    description: string;
}

export const PaymentReceiptEmail = ({
    name = "Customer",
    orderId = "123456",
    amount = "$19.00",
    date = new Date().toLocaleDateString(),
    description = "PPT AI Pro Subscription - Monthly",
}: PaymentReceiptEmailProps) => (
    <Html>
        <Head />
        <Preview>Payment Receipt for {orderId}</Preview>
        <Body style={main}>
            <Container style={container}>
                <Heading style={h1}>Payment Receipt</Heading>
                <Text style={text}>Hi {name},</Text>
                <Text style={text}>
                    This email confirms your payment was successfully processed.
                </Text>

                <Section style={receiptBox}>
                    <Text style={receiptRow}>
                        <span>Order ID:</span> <strong>{orderId}</strong>
                    </Text>
                    <Text style={receiptRow}>
                        <span>Date:</span> <strong>{date}</strong>
                    </Text>
                    <Hr style={{ borderColor: "#eee", margin: "10px 0" }} />
                    <Text style={receiptRow}>
                        <span>{description}</span> <strong>{amount}</strong>
                    </Text>
                    <Hr style={{ borderColor: "#eee", margin: "10px 0" }} />
                    <Text style={receiptRow}>
                        <span>Total:</span> <strong>{amount}</strong>
                    </Text>
                </Section>

                <Section style={btnContainer}>
                    <Button style={button} href="https://pptai.com/settings/billing">
                        View Invoice
                    </Button>
                </Section>

                <Text style={footer}>
                    &copy; {new Date().getFullYear()} PPT AI. All rights reserved.
                </Text>
            </Container>
        </Body>
    </Html>
);

export default PaymentReceiptEmail;

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

const receiptBox = {
    backgroundColor: "#f9f9f9",
    padding: "20px",
    borderRadius: "8px",
    margin: "20px 0",
    border: "1px solid #eee",
};

const receiptRow = {
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
