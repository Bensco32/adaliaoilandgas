/**
 * Helpers to decide what company contact/registration information may be
 * displayed publicly.
 *
 * The company verifies contact details before publication. Until an admin
 * marks a field verified, the public site shows a subtle status note instead
 * of the raw placeholder or the value itself.
 */
import { loadSettings } from "@/lib/settings";

export interface VerifiedField {
  value: string | null;
  pending: boolean;
}

function pick(value: string, requiresVerification: boolean): VerifiedField {
  const trimmed = (value ?? "").trim();
  if (trimmed.length > 0) return { value: trimmed, pending: false };
  return { value: null, pending: requiresVerification };
}

export function displayContact() {
  const company = loadSettings().company;
  return {
    address: pick(company.address, company.addressRequiresVerification),
    phone: pick(company.phone, company.phoneRequiresVerification),
    email: pick(company.email, company.emailRequiresVerification),
    rcNumber: pick(company.rcNumber, company.rcNumberRequiresVerification)
  };
}

export function pendingNote(): string {
  return "To be verified by management and published.";
}
