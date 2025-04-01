import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Link,
  Hr,
  Row,
  Column,
} from "@react-email/components";
import * as React from "react";

interface TaskCreatedEmailProps {
  taskTitle: string;
  taskDescription: string;
  dueDate: string;
  priority: string;
  createdBy: string;
  taskLink: string;
}

export const TaskCreatedEmail = ({
  taskTitle,
  taskDescription,
  dueDate,
  priority,
  createdBy,
  taskLink,
}: TaskCreatedEmailProps) => {
  const previewText = `New task "${taskTitle}" has been assigned to you`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logo}>
            <Heading style={h1}>Task Flow</Heading>
          </Section>

          <Section style={content}>
            <Heading style={h2}>New Task Assigned</Heading>
            <Text style={text}>Hello,</Text>
            <Text style={text}>
              A new task has been assigned to you by {createdBy}.
            </Text>

            <Section style={taskDetails}>
              <Heading as="h3" style={h3}>
                Task Details
              </Heading>
              <Row>
                <Column>
                  <Text style={label}>Task Title</Text>
                  <Text style={value}>{taskTitle}</Text>
                </Column>
              </Row>
              <Row>
                <Column>
                  <Text style={label}>Description</Text>
                  <Text style={value}>{taskDescription}</Text>
                </Column>
              </Row>
              <Row>
                <Column>
                  <Text style={label}>Due Date</Text>
                  <Text style={value}>{dueDate}</Text>
                </Column>
                <Column>
                  <Text style={label}>Priority</Text>
                  <Text style={value}>{priority}</Text>
                </Column>
              </Row>
            </Section>

            <Hr style={hr} />

            <Section style={buttonContainer}>
              <Link href={taskLink} style={button}>
                View Task
              </Link>
            </Section>

            <Text style={footer}>
              This is an automated message from Task Flow. Please do not reply
              to this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const logo = {
  margin: "0 auto",
  padding: "20px 0",
  textAlign: "center" as const,
};

const content = {
  padding: "0 48px",
};

const h1 = {
  color: "#1a1a1a",
  fontSize: "24px",
  fontWeight: "600",
  lineHeight: "40px",
  margin: "0 0 20px",
};

const h2 = {
  color: "#1a1a1a",
  fontSize: "20px",
  fontWeight: "600",
  lineHeight: "32px",
  margin: "0 0 20px",
};

const h3 = {
  color: "#1a1a1a",
  fontSize: "16px",
  fontWeight: "600",
  lineHeight: "24px",
  margin: "0 0 16px",
};

const text = {
  color: "#1a1a1a",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 16px",
};

const taskDetails = {
  backgroundColor: "#f6f9fc",
  padding: "24px",
  borderRadius: "8px",
  margin: "24px 0",
};

const label = {
  color: "#666666",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0 0 4px",
};

const value = {
  color: "#1a1a1a",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 16px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "42px 0 26px",
};

const buttonContainer = {
  padding: "27px 0 27px",
  textAlign: "center" as const,
};

const button = {
  backgroundColor: "#000000",
  borderRadius: "4px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "100%",
  padding: "12px",
};

const footer = {
  color: "#666666",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0",
};
