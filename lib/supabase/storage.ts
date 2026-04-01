/**
 * Construct the public URL for an audio file in Supabase Storage.
 * The "audio" bucket must be set to public in Supabase Dashboard.
 */
export function getAudioUrl(audioPath: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/audio/${audioPath}`;
}
