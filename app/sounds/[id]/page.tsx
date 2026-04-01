import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSoundById } from "@/lib/data/sounds";
import { SoundDetail } from "@/components/sounds/sound-detail";
import { siteConfig } from "@/lib/config/site";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const sound = await getSoundById(id);
  if (!sound) return { title: "Sound not found" };

  return {
    title: sound.title,
    description: sound.note || `A field recording on ${siteConfig.name}`,
  };
}

export default async function SoundPage({ params }: Props) {
  const { id } = await params;
  const sound = await getSoundById(id);

  if (!sound) notFound();

  return <SoundDetail sound={sound} />;
}
