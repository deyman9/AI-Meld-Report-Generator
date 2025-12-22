import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { sendEmail, verifyEmailConfig } from "@/lib/email";
import { buildReportReadyEmail } from "@/lib/email/templates/reportReady";

// GET /api/test-email - Verify email configuration
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const isConfigured = await verifyEmailConfig();

    return NextResponse.json({
      success: true,
      configured: isConfigured,
      config: {
        host: process.env.SMTP_HOST ? "Set" : "Not set",
        port: process.env.SMTP_PORT || "Not set",
        user: process.env.SMTP_USER ? "Set" : "Not set",
        password: process.env.SMTP_PASSWORD ? "Set" : "Not set",
        from: process.env.SMTP_FROM || "Not set",
      },
    });
  } catch (error) {
    console.error("Error verifying email config:", error);
    return NextResponse.json(
      { success: false, error: "Failed to verify email configuration" },
      { status: 500 }
    );
  }
}

// POST /api/test-email - Send a test email
export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Build test email using the report ready template
    const { subject, html, text } = buildReportReadyEmail({
      companyName: "Test Company Inc.",
      reportType: "FOUR09A",
      valuationDate: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      dashboardUrl: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/dashboard`,
      warnings: ["This is a test warning", "Another test warning for review"],
    });

    await sendEmail({
      to: session.user.email,
      subject: `[TEST] ${subject}`,
      html,
      text,
    });

    return NextResponse.json({
      success: true,
      message: `Test email sent to ${session.user.email}`,
    });
  } catch (error) {
    console.error("Error sending test email:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to send test email" 
      },
      { status: 500 }
    );
  }
}

