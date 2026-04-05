import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { siteConfig } from "@/lib/config/site";

export const metadata: Metadata = {
  title: `Reset password — ${siteConfig.name}`,
};

export default function ForgotPasswordPage() {
  return (
    <>
      <h2 className="text-center text-[15px] font-medium text-[var(--color-text-primary)] mb-6">
        Reset your password
      </h2>
      <ForgotPasswordForm />
    </>
  );
}
