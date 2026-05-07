const PROOF_LINE_REGEX = /^Purchase Proof:\s*(.+)$/im;
const PROOF_REASON_LINE_REGEX = /^Purchase Proof Reason:\s*(.+)$/im;
const PROOF_PUBLIC_IDS_REGEX = /\[\[PROOF_PUBLIC_IDS:[^\]]+\]\]/g;

export const parseListingDescription = (raw = "") => {
  const text = String(raw || "");
  const proofMatch = text.match(PROOF_LINE_REGEX);
  const proofReasonMatch = text.match(PROOF_REASON_LINE_REGEX);

  const proofUrls = proofMatch?.[1]
    ? proofMatch[1]
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  const proofReason = proofReasonMatch?.[1]?.trim() || "";

  const cleaned = text
    .replace(PROOF_LINE_REGEX, "")
    .replace(PROOF_REASON_LINE_REGEX, "")
    .replace(PROOF_PUBLIC_IDS_REGEX, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return {
    cleanDescription: cleaned,
    proofUrls,
    proofReason,
  };
};
