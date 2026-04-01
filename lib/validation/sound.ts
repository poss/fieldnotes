import { siteConfig } from "@/lib/config/site";

export interface ValidationError {
  field: string;
  message: string;
}

export function validateTitle(title: string): ValidationError | null {
  const trimmed = title.trim();
  if (!trimmed) {
    return { field: "title", message: "Title is required." };
  }
  if (trimmed.length > siteConfig.validation.maxTitleLength) {
    return {
      field: "title",
      message: `Title must be ${siteConfig.validation.maxTitleLength} characters or less.`,
    };
  }
  return null;
}

export function validateNote(note: string): ValidationError | null {
  if (note.length > siteConfig.validation.maxNoteLength) {
    return {
      field: "note",
      message: `Note must be ${siteConfig.validation.maxNoteLength} characters or less.`,
    };
  }
  return null;
}

export function validateDuration(seconds: number): ValidationError | null {
  if (seconds <= 0) {
    return { field: "duration", message: "Audio file appears to be empty." };
  }
  if (seconds > siteConfig.upload.maxDurationSeconds) {
    return {
      field: "duration",
      message: `Clip must be ${siteConfig.upload.maxDurationSeconds} seconds or less. Yours is ${Math.round(seconds)} seconds.`,
    };
  }
  return null;
}

export function validateFileSize(bytes: number): ValidationError | null {
  const maxBytes = siteConfig.upload.maxFileSizeMB * 1024 * 1024;
  if (bytes > maxBytes) {
    return {
      field: "file",
      message: `File is too large (${(bytes / 1024 / 1024).toFixed(1)}MB). Maximum is ${siteConfig.upload.maxFileSizeMB}MB.`,
    };
  }
  return null;
}

export function validateCoordinates(
  lat: number,
  lng: number
): ValidationError | null {
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return { field: "location", message: "Invalid coordinates." };
  }
  return null;
}
