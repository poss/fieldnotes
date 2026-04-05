import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { siteConfig } from "@/lib/config/site";

export const metadata: Metadata = {
  title: `Set new password — ${siteConfig.name}`,
};

export default function ResetPasswordPage() {
  return (
    <div className="min-h-full flex flex-col items-center justify-center px-5 py-12 bg-[var(--color-bg)]">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-lg font-medium tracking-tight text-[var(--color-text-primary)]">
              {siteConfig.name}
            </h1>
          </Link>
        </div>
        <h2 className="text-center text-[15px] font-medium text-[var(--color-text-primary)] mb-6">
          Set a new password
        </h2>
        <ResetPasswordForm />
      </div>
    </div>
  );
}
