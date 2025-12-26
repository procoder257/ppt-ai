import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Link,
    Preview,
    Section,
    Text,
    Button,
} from "@react-email/components";
import * as React from "react";

interface WelcomeEmailProps {
    name?: string;
}

export const WelcomeEmail = ({
    name = "there",
}: WelcomeEmailProps) => (
    <Html>
        <Head />
        <Preview>Welcome to PPT AI - Create stunning presentations in seconds!</Preview>
        <Body style={main}>
            <Container style={container}>
                <Heading style={h1}>Welcome to PPT AI! 🚀</Heading>
                <Text style={text}>Hi {name},</Text>
                <Text style={text}>
                    Thank you for joining PPT AI. We re excited to help you transform your ideas into
                    professional presentations instantly using AI.
                </Text>
                <Section style={btnContainer}>
                    <Button style={button} href="https://pptai.com/presentation">
                        Create Your First Presentation
                    </Button>
                </Section>
                <Text style={text}>
                    If you have any questions or need help, feel free to reply to this email.
                </Text>
                <Text style={footer}>
                    &copy; {new Date().getFullYear()} PPT AI. All rights reserved.
                </Text>
            </Container>
        </Body>
    </Html>
);

export default WelcomeEmail;

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

const btnContainer = {
    textAlign: "center" as const,
    margin: "30px 0",
};

const button = {
    backgroundColor: "#000000",
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
