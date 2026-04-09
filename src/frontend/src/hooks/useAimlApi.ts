// AIML API integration replacing Puter.js
// Endpoint: https://api.aimlapi.com
// Docs: https://docs.aimlapi.com

const AIML_API_KEY = "5189b17d8dade61954ce2323f25736e5";
const AIML_BASE_URL = "https://api.aimlapi.com";

const AIML_HEADERS = {
  Authorization: `Bearer ${AIML_API_KEY}`,
  "Content-Type": "application/json",
};

/**
 * Upload a base64 image to a temporary hosting service and return a public URL.
 * Uses tmpfiles.org which is free and requires no API key.
 */
async function uploadBase64ToPublicUrl(
  base64: string,
  mime = "image/jpeg",
): Promise<string> {
  const dataUrl = base64.startsWith("data:")
    ? base64
    : `data:${mime};base64,${base64}`;
  const byteString = atob(dataUrl.split(",")[1]);
  const bytes = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    bytes[i] = byteString.charCodeAt(i);
  }
  const ext = mime.includes("png") ? "png" : "jpg";
  const blob = new Blob([bytes], { type: mime });
  const form = new FormData();
  form.append("file", blob, `image.${ext}`);

  const res = await fetch("https://tmpfiles.org/api/v1/upload", {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    throw new Error(`Image upload failed: ${res.status}`);
  }

  const data = await res.json();
  // tmpfiles returns { data: { url: "https://tmpfiles.org/XXXXXX/image.jpg" } }
  // Direct download URL uses /dl/ path instead of viewing URL
  const viewUrl: string = data?.data?.url;
  if (!viewUrl) throw new Error("Image upload returned no URL");
  // Convert view URL to direct download URL
  return viewUrl.replace("tmpfiles.org/", "tmpfiles.org/dl/");
}

/**
 * Generate or edit an image using AIML API.
 * - If imageBase64 or imageUrl is provided, uses flux/kontext-pro/image-to-image (img2img).
 *   The base64 image is first uploaded to a temp host to get a public URL.
 * - Otherwise uses flux/schnell (FLUX.1 Schnell, txt2img).
 *
 * Returns a URL string to the generated image.
 */
export async function aimlTxt2Img(
  prompt: string,
  options?: {
    imageBase64?: string; // base64 string (with or without data: prefix)
    imageMime?: string;
    imageUrl?: string;
    model?: string;
  },
): Promise<string> {
  const hasInput = !!(options?.imageBase64 || options?.imageUrl);

  const model =
    options?.model ??
    (hasInput ? "flux/kontext-pro/image-to-image" : "flux/schnell");

  const body: Record<string, unknown> = {
    model,
    prompt,
  };

  if (hasInput) {
    let imageUrl = options?.imageUrl;

    // If we have base64 but no URL, upload to get a public URL
    if (!imageUrl && options?.imageBase64) {
      const mime = options?.imageMime || "image/jpeg";
      imageUrl = await uploadBase64ToPublicUrl(options.imageBase64, mime);
    }

    body.image_url = imageUrl;
  }

  const response = await fetch(`${AIML_BASE_URL}/v1/images/generations`, {
    method: "POST",
    headers: AIML_HEADERS,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`AIML API image error ${response.status}: ${errText}`);
  }

  const data = await response.json();

  // Try both response shapes
  const url =
    data?.images?.[0]?.url ?? data?.data?.[0]?.url ?? data?.data?.[0]?.b64_json;

  if (!url) {
    throw new Error("AIML API returned no image URL");
  }

  // If it's base64, convert to data URL
  if (!url.startsWith("http") && !url.startsWith("data:")) {
    return `data:image/png;base64,${url}`;
  }

  return url;
}

/**
 * Generate a video using AIML API (async polling pattern).
 * Uses kling-video/v1.6/standard/text-to-video.
 * Returns a URL to the generated video.
 */
export async function aimlTxt2Vid(
  prompt: string,
  options?: {
    seconds?: number;
    size?: string;
  },
): Promise<string> {
  const model = "kling-video/v1.6/standard/text-to-video";

  // Step 1: Start generation
  const startRes = await fetch(
    `${AIML_BASE_URL}/v2/generate/video/kling/generation`,
    {
      method: "POST",
      headers: AIML_HEADERS,
      body: JSON.stringify({
        model,
        prompt,
        duration: options?.seconds ? String(options.seconds) : "5",
        aspect_ratio: "16:9",
      }),
    },
  );

  if (!startRes.ok) {
    const errText = await startRes.text();
    throw new Error(
      `AIML API video start error ${startRes.status}: ${errText}`,
    );
  }

  const startData = await startRes.json();
  const generationId = startData?.generation_id ?? startData?.id;

  if (!generationId) {
    throw new Error("AIML API did not return a generation_id for video");
  }

  // Step 2: Poll until complete
  const maxPolls = 60;
  const pollInterval = 5000; // 5 seconds

  for (let i = 0; i < maxPolls; i++) {
    await new Promise((r) => setTimeout(r, pollInterval));

    const pollRes = await fetch(
      `${AIML_BASE_URL}/v2/generate/video/kling/generation?generation_id=${generationId}`,
      {
        method: "GET",
        headers: AIML_HEADERS,
      },
    );

    if (!pollRes.ok) continue;

    const pollData = await pollRes.json();
    const status = pollData?.status;

    if (status === "completed" || status === "succeeded") {
      const videoUrl =
        pollData?.video?.url ?? pollData?.output?.video_url ?? pollData?.url;
      if (videoUrl) return videoUrl;
    }

    if (status === "failed" || status === "error") {
      throw new Error("AIML API video generation failed");
    }
  }

  throw new Error("AIML API video generation timed out");
}

/**
 * Convenience hook (stateless) - returns the API functions directly.
 * Kept as a hook-like export for easy drop-in replacement of usePuter.
 */
export function useAimlApi() {
  return {
    isReady: true,
    generateImage: aimlTxt2Img,
    generateVideo: aimlTxt2Vid,
  };
}
