"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { createSoundPost } from "@/app/upload/actions";
import { FilePicker } from "./file-picker";
import { LocationPicker } from "./location-picker";
import { MetadataForm } from "./metadata-form";

type Step = "file" | "location" | "details" | "submitting";

interface UploadFlowProps {
  userId: string;
}

export function UploadFlow({ userId }: UploadFlowProps) {
  const router = useRouter();
  const submittingRef = useRef(false);

  const [step, setStep] = useState<Step>("file");
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [uploadPhase, setUploadPhase] = useState<"uploading" | "saving">("uploading");

  // File state
  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState<number>(0);

  // Location state
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationSource, setLocationSource] = useState<"device" | "manual">(
    "manual"
  );

  // Metadata state
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");

  function handleFileSelected(selectedFile: File, fileDuration: number) {
    setFile(selectedFile);
    setDuration(fileDuration);
    setStep("location");
  }

  function handleLocationConfirmed(
    lat: number,
    lng: number,
    source: "device" | "manual"
  ) {
    setCoordinates({ lat, lng });
    setLocationSource(source);
    setStep("details");
  }

  async function handleSubmit() {
    if (!file || !coordinates || submittingRef.current) return;

    submittingRef.current = true;
    setStep("submitting");
    setUploadPhase("uploading");
    setError(null);

    try {
      const supabase = createClient();

      // Upload audio to storage (direct client upload for speed)
      const ext = file.name.split(".").pop() || "mp3";
      const audioPath = `${userId}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("audio")
        .upload(audioPath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      setUploadPhase("saving");

      // Insert metadata via Server Action (validated + rate-limited server-side)
      const result = await createSoundPost({
        userId,
        title,
        note,
        audioPath,
        durationSeconds: duration,
        captureLat: coordinates.lat,
        captureLng: coordinates.lng,
        locationSource,
      });

      if (!result.success) {
        // Clean up the uploaded file if metadata insert failed
        await supabase.storage.from("audio").remove([audioPath]);
        throw new Error(result.error || "Failed to save sound.");
      }

      router.push(`/sounds/${result.soundId}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      const isNetworkError = message.includes("fetch") || message.includes("network") || message.includes("Failed to fetch");
      setError(
        isNetworkError
          ? "Network error — check your connection and try again."
          : message
      );
      setStep("details");
      setRetryCount((c) => c + 1);
      submittingRef.current = false;
    }
  }

  return (
    <div className="min-h-full bg-[var(--color-bg)]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[var(--color-bg-overlay)] backdrop-blur-sm border-b border-[var(--color-border-subtle)]">
        <div className="max-w-lg mx-auto px-5 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-[15px] font-medium text-[var(--color-text-primary)]">
              Upload a sound
            </h1>
            <p className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5">
              {step === "file" && "Choose an audio file."}
              {step === "location" && "Set the location."}
              {step === "details" && "Add details."}
              {step === "submitting" && uploadPhase === "uploading" && "Uploading audio..."}
              {step === "submitting" && uploadPhase === "saving" && "Saving..."}
            </p>
          </div>
          <Link
            href="/"
            className="text-[12px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
          >
            Cancel
          </Link>
        </div>
      </div>

      {/* Step content */}
      <div className="max-w-lg mx-auto px-5 py-6">
        {step === "file" && (
          <FilePicker onFileSelected={handleFileSelected} />
        )}

        {step === "location" && (
          <LocationPicker
            onConfirm={handleLocationConfirmed}
            onBack={() => setStep("file")}
          />
        )}

        {step === "details" && (
          <MetadataForm
            title={title}
            note={note}
            onTitleChange={setTitle}
            onNoteChange={setNote}
            onBack={() => setStep("location")}
            onSubmit={handleSubmit}
            error={error}
            file={file}
            duration={duration}
          />
        )}

        {step === "submitting" && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-[13px] text-[var(--color-text-secondary)]">
              {uploadPhase === "uploading" ? "Uploading audio…" : "Saving…"}
            </p>
            <div className="flex gap-1.5 mt-3">
              <div className={`w-1.5 h-1.5 rounded-full transition-colors ${uploadPhase === "uploading" ? "bg-[var(--color-accent)]" : "bg-[var(--color-border)]"}`} />
              <div className={`w-1.5 h-1.5 rounded-full transition-colors ${uploadPhase === "saving" ? "bg-[var(--color-accent)]" : "bg-[var(--color-border)]"}`} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
