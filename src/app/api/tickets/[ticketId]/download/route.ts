import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { ImageResponse } from "next/og";
import QRCode from "qrcode";
import * as React from "react";

function formatTicketId(ticketId: string): string {
  const clean = ticketId.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (clean.length >= 8) {
    return `EYF-${clean.slice(0, 4)}-${clean.slice(4, 8)}`;
  }
  return `EYF-${clean}`;
}

// GET /api/tickets/[ticketId]/download — download ticket as PNG
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const { ticketId } = await params;

    const member = await prisma.member.findUnique({
      where: { ticketId },
      include: {
        church: { select: { name: true } },
      },
    });

    if (!member) {
      return Response.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Generate QR code as data URL (more reliable with Satori/next/og)
    const qrDataUrl = await QRCode.toDataURL(ticketId, {
      width: 300,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
      errorCorrectionLevel: "H",
    });
    const displayName = `${member.firstName} ${member.lastName}`;
    const churchName = member.church.name;
    const displayTicketId = formatTicketId(member.ticketId);
    const checkedInText = member.checkedIn ? "✓ CHECKED IN" : "";

    const fileName = `ticket-${member.firstName}-${member.lastName}.png`;

    return new ImageResponse(
      React.createElement(
        "div",
        {
          style: {
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0a0e27",
            backgroundImage: "linear-gradient(to bottom, #0a0e27, #1a2148)",
            padding: "40px",
            fontFamily: "sans-serif",
          },
        },
        // Main Container/Card effect via border
        React.createElement("div", {
          style: {
            position: "absolute",
            top: "20px",
            left: "20px",
            right: "20px",
            bottom: "20px",
            border: "2px dashed #f5a623",
            borderRadius: "24px",
            display: "flex",
          },
        }),
        // Header
        React.createElement(
          "div",
          {
            style: {
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: "40px",
            },
          },
          React.createElement(
            "div",
            {
              style: {
                width: "60px",
                height: "60px",
                backgroundColor: "#f5a623",
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "12px",
              },
            },
            React.createElement(
              "span",
              {
                style: {
                  color: "#0a0e27",
                  fontSize: "32px",
                  fontWeight: "bold",
                },
              },
              "E"
            )
          ),
          React.createElement(
            "h1",
            {
              style: {
                fontSize: "42px",
                fontWeight: "bold",
                color: "#f5a623",
                margin: 0,
                textTransform: "uppercase",
              },
            },
            "EYF U/BORO"
          ),
          React.createElement(
            "p",
            {
              style: {
                fontSize: "18px",
                color: "#8b8fa8",
                margin: "4px 0 0 0",
              },
            },
            "Dinner Event"
          )
        ),
        // Divider
        React.createElement("div", {
          style: {
            width: "80%",
            height: "1px",
            backgroundColor: "rgba(245,166,35,0.2)",
            marginBottom: "40px",
          },
        }),
        // QR Code Box
        React.createElement(
          "div",
          {
            style: {
              backgroundColor: "white",
              padding: "16px",
              borderRadius: "24px",
              display: "flex",
              marginBottom: "40px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            },
          },
          React.createElement("img", {
            src: qrDataUrl,
            width: 300,
            height: 300,
            style: { display: "block" },
            alt: "QR Code",
          })
        ),
        // Member Info
        React.createElement(
          "div",
          {
            style: {
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            },
          },
          React.createElement(
            "h2",
            {
              style: {
                fontSize: "32px",
                fontWeight: "bold",
                color: "#f5a623",
                margin: "0 0 8px 0",
              },
            },
            displayName
          ),
          React.createElement(
            "p",
            {
              style: {
                fontSize: "20px",
                color: "#8b8fa8",
                margin: "0 0 16px 0",
              },
            },
            churchName
          ),
          React.createElement(
            "div",
            {
              style: {
                backgroundColor: "rgba(245,166,35,0.1)",
                padding: "8px 20px",
                borderRadius: "12px",
                display: "flex",
              },
            },
            React.createElement(
              "span",
              {
                style: {
                  fontSize: "20px",
                  color: "#f5a623",
                  fontFamily: "monospace",
                  fontWeight: "bold",
                },
              },
              displayTicketId
            )
          )
        ),
        // Status
        checkedInText &&
          React.createElement(
            "div",
            {
              style: {
                marginTop: "20px",
                display: "flex",
              },
            },
            React.createElement(
              "span",
              {
                style: {
                  fontSize: "16px",
                  color: "#10b981",
                  fontWeight: "bold",
                },
              },
              checkedInText
            )
          ),
        // Footer
        React.createElement(
          "p",
          {
            style: {
              position: "absolute",
              bottom: "60px",
              fontSize: "14px",
              color: "#5a5f7a",
            },
          },
          "Present this ticket at the entrance"
        )
      ),
      {
        width: 600,
        height: 900,
        headers: {
          "Content-Disposition": `attachment; filename="${fileName}"`,
        },
      }
    );
  } catch (error) {
    console.error("Failed to generate ticket:", error);
    return Response.json(
      { error: "Failed to generate ticket" },
      { status: 500 }
    );
  }
}
