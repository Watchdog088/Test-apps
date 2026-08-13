/**
 * mfa-service.js — Sprint 3: Multi-Factor Authentication service
 * Wraps Firebase Auth MFA (TOTP + Phone) enrollment and verification.
 * NEW file — nothing imports it until AccountSecurityPages wires it up.
 */

import { auth } from '@/firebase/config';
import {
  multiFactor,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  TotpMultiFactorGenerator,
  RecaptchaVerifier,
} from 'firebase/auth';

// ── Check if current user has MFA enrolled ────────────────────────
export async function isMFAEnabled() {
  const user = auth.currentUser;
  if (!user) return false;
  const enrolledFactors = multiFactor(user).enrolledFactors;
  return enrolledFactors.length > 0;
}

// ── Get enrolled MFA factors ──────────────────────────────────────
export function getEnrolledFactors() {
  const user = auth.currentUser;
  if (!user) return [];
  return multiFactor(user).enrolledFactors;
}

// ── Enroll TOTP (Authenticator App) ──────────────────────────────
export async function enrollTOTP() {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  const multiFactorSession = await multiFactor(user).getSession();
  const totpSecret = await TotpMultiFactorGenerator.generateSecret(multiFactorSession);

  const qrCodeUrl = totpSecret.generateQrCodeUrl(
    user.email || 'user',
    'LynkApp',
  );

  return { totpSecret, qrCodeUrl };
}

// ── Verify and finalize TOTP enrollment ─────────────────────────
export async function finalizeTOTPEnrollment(totpSecret, verificationCode, displayName = 'Authenticator App') {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  const multiFactorAssertion = TotpMultiFactorGenerator.assertionForEnrollment(
    totpSecret,
    verificationCode,
  );

  await multiFactor(user).enroll(multiFactorAssertion, displayName);
  return true;
}

// ── Enroll Phone as MFA factor ────────────────────────────────────
export async function enrollPhone(phoneNumber, recaptchaContainerId) {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  const recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
    size: 'invisible',
  });

  const multiFactorSession = await multiFactor(user).getSession();
  const phoneInfoOptions = { phoneNumber, session: multiFactorSession };
  const phoneAuthProvider = new PhoneAuthProvider(auth);
  const verificationId = await phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, recaptchaVerifier);

  return verificationId;
}

// ── Finalize phone MFA enrollment ─────────────────────────────────
export async function finalizePhoneEnrollment(verificationId, verificationCode, displayName = 'Phone') {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  const phoneAuthCredential = PhoneAuthProvider.credential(verificationId, verificationCode);
  const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(phoneAuthCredential);

  await multiFactor(user).enroll(multiFactorAssertion, displayName);
  return true;
}

// ── Unenroll a specific MFA factor ────────────────────────────────
export async function unenrollFactor(factor) {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  await multiFactor(user).unenroll(factor);
}

export default {
  isMFAEnabled,
  getEnrolledFactors,
  enrollTOTP,
  finalizeTOTPEnrollment,
  enrollPhone,
  finalizePhoneEnrollment,
  unenrollFactor,
};
