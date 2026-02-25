import { renderPostOgImage } from "@/lib/og";

export const runtime = "nodejs";
export const alt = "Libertas - Freedom Tech Signal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return renderPostOgImage(slug);
}
