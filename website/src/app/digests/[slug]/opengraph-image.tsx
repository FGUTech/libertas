import { renderDigestOgImage } from "@/lib/og";

export const runtime = "nodejs";
export const alt = "Libertas - Weekly Digest";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return renderDigestOgImage(slug);
}
