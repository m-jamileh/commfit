import { createBrowserClient } from "@supabase/ssr";

export interface UploadJobPhotoResult {
  url: string;
  path: string;
}

export interface UploadJobPhotoOpts {
  jobId: string;
  accountId: string;
}

function getSupabaseStorageClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://localhost:54321";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "anon-key-placeholder";
  return createBrowserClient(url, key);
}

export async function uploadJobPhoto(
  file: File,
  opts: UploadJobPhotoOpts,
): Promise<UploadJobPhotoResult> {
  const supabase = getSupabaseStorageClient();
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${opts.accountId}/${opts.jobId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("job-photos")
    .upload(path, file, { contentType: file.type });

  if (error) {
    throw new Error(`Photo upload failed: ${error.message}`);
  }

  const { data: signed, error: signError } = await supabase.storage
    .from("job-photos")
    .createSignedUrl(path, 60 * 60 * 24 * 365); // 1-year TTL

  if (signError || !signed) {
    throw new Error(`Signed URL creation failed: ${signError?.message ?? "unknown"}`);
  }

  return { url: signed.signedUrl, path };
}
