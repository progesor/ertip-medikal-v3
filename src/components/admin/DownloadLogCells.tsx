import Link from "next/link";
import type { DefaultServerCellComponentProps } from "payload";

function maskAccessCode(value: unknown) {
  const code = typeof value === "string" ? value : "";

  if (!code) return "—";
  if (code.length <= 2) return "**";
  if (code.length <= 4) return `${code.slice(0, 1)}***${code.slice(-1)}`;

  return `${code.slice(0, 2)}***${code.slice(-2)}`;
}

export function MaskedAccessCodeCell({
  cellData,
  linkURL,
}: DefaultServerCellComponentProps) {
  const maskedCode = maskAccessCode(cellData);
  const content = (
    <span
      title="Tam kodu görmek için kayıt detayını açın"
      style={{ fontFamily: "monospace", letterSpacing: "0.08em" }}
    >
      {maskedCode}
    </span>
  );

  return linkURL ? <Link href={linkURL}>{content}</Link> : content;
}
