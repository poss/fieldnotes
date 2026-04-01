import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSoundById } from "@/lib/data/sounds";
import { ReportForm } from "@/components/report/report-form";

export const metadata: Metadata = {
  title: "Report",
};

interface Props {
  params: Promise<{ soundId: string }>;
}

export default async function ReportPage({ params }: Props) {
  const { soundId } = await params;
  const sound = await getSoundById(soundId);

  if (!sound) notFound();

  return (
    <div className="min-h-full bg-[var(--color-bg)]">
      <div className="max-w-lg mx-auto px-5 py-8">
        <h1 className="text-[15px] font-medium text-[var(--color-text-primary)]">
          Report a sound
        </h1>
        <p className="text-[13px] text-[var(--color-text-tertiary)] mt-1 mb-6">
          Reporting &ldquo;{sound.title}&rdquo;
        </p>
        <ReportForm soundId={soundId} />
      </div>
    </div>
  );
}
