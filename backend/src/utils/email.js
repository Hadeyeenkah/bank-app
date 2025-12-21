exports.sendVerificationEmail = async (email, link) => {
  // For now, log the verification link. Integrate with provider (e.g., SendGrid) later.
  console.log(`[EMAIL] Verification to ${email}: ${link}`);
  return true;
};
