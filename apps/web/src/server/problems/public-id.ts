import { randomInt } from "node:crypto";

// Human-quotable tracking id, e.g. SMD-7F3K-9021. Not a security token -
// resource access is still authorised per request.
export function generatePublicId(): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const block = (length: number) =>
    Array.from({ length }, () => alphabet[randomInt(0, alphabet.length)]).join(
      ""
    );
  return `SMD-${block(4)}-${block(4)}`;
}
