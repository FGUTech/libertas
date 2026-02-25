import { renderPostTwitterImage } from "@/lib/og";

export const runtime = "nodejs";
export const alt = "Libertas - Freedom Tech Signal";
export const size = { width: 800, height: 800 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return renderPostTwitterImage(slug);
}
