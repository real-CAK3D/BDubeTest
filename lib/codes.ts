import "server-only";
import bwipjs from "bwip-js/node";

/** A QR code as an SVG string (for links the admin scans). */
export function qrSvg(text: string) {
  return bwipjs.toSVG({ bcid: "qrcode", text, scale: 3 });
}

/** A Code 128 barcode as an SVG string, with the code printed under it (any scanner reads it). */
export function barcodeSvg(text: string) {
  return bwipjs.toSVG({ bcid: "code128", text, height: 12, includetext: true, textxalign: "center", textsize: 9 });
}
