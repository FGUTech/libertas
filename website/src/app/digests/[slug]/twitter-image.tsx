import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";
import { getDigestBySlug, getAllDigests } from "@/lib/posts";

export const runtime = "nodejs";
export const alt = "Libertas - Weekly Digest";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const logoData = readFileSync(join(process.cwd(), "public", "app-icon.png"));
const logoSrc = `data:image/png;base64,${logoData.toString("base64")}`;

const MATRIX_CHARS =
  "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";

function seededRandom(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  return () => {
    hash = ((hash * 1103515245 + 12345) & 0x7fffffff);
    return (hash % 1000) / 1000;
  };
}

function generateMatrixChars(
  slug: string
): { char: string; x: number; y: number; opacity: number }[] {
  const rand = seededRandom(slug);
  const chars: { char: string; x: number; y: number; opacity: number }[] = [];

  for (let col = 0; col < 60; col++) {
    const x = col * 20;
    const colLength = Math.floor(rand() * 15) + 5;
    const startY = Math.floor(rand() * 300);

    for (let row = 0; row < colLength; row++) {
      const charIdx = Math.floor(rand() * MATRIX_CHARS.length);
      chars.push({
        char: MATRIX_CHARS[charIdx],
        x,
        y: startY + row * 28,
        opacity: Math.max(0.03, 0.12 - row * 0.008),
      });
    }
  }

  return chars;
}

const TOPIC_COLORS: Record<string, string> = {
  bitcoin: "#ffb800",
  zk: "#a855f7",
  privacy: "#00ff41",
  surveillance: "#ff3c3c",
  "censorship-resistance": "#00b4ff",
  comms: "#00b4ff",
  payments: "#ffb800",
  identity: "#a855f7",
  activism: "#ff6b6b",
  sovereignty: "#00ff41",
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const digest = getDigestBySlug(slug);

  if (!digest) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0a0a0a",
            color: "#e0e0e0",
            fontSize: 32,
          }}
        >
          Digest Not Found
        </div>
      ),
      { ...size }
    );
  }

  const matrixChars = generateMatrixChars(slug);
  const titleSize =
    digest.title.length > 90 ? 36 : digest.title.length > 60 ? 42 : 48;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#0a0a0a",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "1200px",
            height: "630px",
            display: "flex",
          }}
        >
          {matrixChars.map((mc, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${mc.x}px`,
                top: `${mc.y}px`,
                color: "#ffb800",
                fontSize: "16px",
                fontFamily: "monospace",
                opacity: mc.opacity,
              }}
            >
              {mc.char}
            </div>
          ))}
        </div>

        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "1200px",
            height: "630px",
            background:
              "linear-gradient(180deg, rgba(10,10,10,0.4) 0%, rgba(10,10,10,0.85) 35%, rgba(10,10,10,0.95) 100%)",
            display: "flex",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            padding: "48px 60px",
            height: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoSrc}
              width={44}
              height={44}
              alt=""
              style={{ borderRadius: "4px" }}
            />
            <span
              style={{
                color: "#00ff41",
                fontSize: "22px",
                fontWeight: 700,
                letterSpacing: "3px",
              }}
            >
              LIBERTAS
            </span>
            <div
              style={{
                marginLeft: "16px",
                color: "#ffb800",
                fontSize: "14px",
                fontWeight: 600,
                border: "1px solid #ffb80060",
                borderRadius: "6px",
                padding: "4px 14px",
                backgroundColor: "#ffb80020",
                display: "flex",
              }}
            >
              WEEKLY DIGEST
            </div>
          </div>

          <div
            style={{
              width: "80px",
              height: "3px",
              backgroundColor: "#ffb800",
              marginTop: "24px",
              borderRadius: "2px",
              display: "flex",
            }}
          />

          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              paddingTop: "8px",
              paddingBottom: "8px",
            }}
          >
            <div
              style={{
                color: "#ffb800",
                fontSize: `${titleSize}px`,
                fontWeight: 700,
                lineHeight: 1.25,
                maxWidth: "1000px",
                display: "flex",
              }}
            >
              {digest.title}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              {digest.topTopics.slice(0, 4).map((topic) => {
                const color = TOPIC_COLORS[topic] || "#00ff41";
                return (
                  <div
                    key={topic}
                    style={{
                      color,
                      fontSize: "14px",
                      fontWeight: 600,
                      border: `1px solid ${color}50`,
                      borderRadius: "6px",
                      padding: "5px 14px",
                      backgroundColor: `${color}15`,
                      display: "flex",
                    }}
                  >
                    {topic}
                  </div>
                );
              })}
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: "4px",
              }}
            >
              <span style={{ color: "#a0a0a0", fontSize: "14px" }}>
                {formatDate(digest.periodStart)} — {formatDate(digest.periodEnd)}
              </span>
              <span style={{ color: "#868686", fontSize: "16px" }}>
                libertas.fgu.tech
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}

export async function generateStaticParams() {
  const digests = getAllDigests();
  return digests.map((digest) => ({ slug: digest.slug }));
}
