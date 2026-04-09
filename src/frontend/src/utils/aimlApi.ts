const AIML_API_KEY = "5189b17d8dade61954ce2323f25736e5";
const AIML_BASE_URL = "https://api.aimlapi.com";

export async function generateImageAiml(
  prompt: string,
  imageDataUrl?: string | null,
): Promise<string> {
  const hasInput = !!imageDataUrl;

  const body: Record<string, unknown> = {
    model: hasInput ? "flux/kontext-pro/image-to-image" : "flux/schnell",
    prompt,
  };

  if (hasInput) {
    body.image = imageDataUrl!.startsWith("data:")
      ? imageDataUrl
      : `data:image/jpeg;base64,${imageDataUrl}`;
  }

  const res = await fetch(`${AIML_BASE_URL}/v1/images/generations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AIML_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AIML API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const url =
    data?.images?.[0]?.url || data?.data?.[0]?.url || data?.output?.[0] || "";
  if (!url) throw new Error("AIML API returned no image URL");
  return url;
}

export async function generateVideoAiml(
  prompt: string,
  _duration?: number,
  _resolution?: string,
): Promise<string> {
  const res = await fetch(
    `${AIML_BASE_URL}/v2/generate/video/luma-ai/generation`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AIML_API_KEY}`,
      },
      body: JSON.stringify({ prompt }),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AIML Video API error ${res.status}: ${text}`);
  }

  const initData = await res.json();
  const generationId = initData?.id;
  if (!generationId) throw new Error("No generation ID from AIML video API");

  // Poll until done (max 2 minutes)
  const start = Date.now();
  while (Date.now() - start < 120000) {
    await new Promise((r) => setTimeout(r, 5000));
    const poll = await fetch(
      `${AIML_BASE_URL}/v2/generate/video/luma-ai/generation?generation_id=${generationId}`,
      {
        headers: { Authorization: `Bearer ${AIML_API_KEY}` },
      },
    );
    if (!poll.ok) continue;
    const pollData = await poll.json();
    if (pollData?.state === "completed" && pollData?.video?.url) {
      return pollData.video.url;
    }
    if (pollData?.state === "failed") {
      throw new Error("AIML video generation failed");
    }
  }
  throw new Error("AIML video generation timed out");
}
