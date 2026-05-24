import QRCode from "qrcode";

export async function generateQRDataURL(ticketId: string): Promise<string> {
  return QRCode.toDataURL(ticketId, {
    width: 400,
    margin: 2,
    color: {
      dark: "#0a0e27",
      light: "#ffffff",
    },
    errorCorrectionLevel: "H",
  });
}

export async function generateQRSVG(ticketId: string): Promise<string> {
  return QRCode.toString(ticketId, {
    type: "svg",
    width: 400,
    margin: 2,
    color: {
      dark: "#0a0e27",
      light: "#ffffff",
    },
    errorCorrectionLevel: "H",
  });
}
