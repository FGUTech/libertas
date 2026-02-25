import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";
import { getPostBySlug, getAllPosts } from "@/lib/posts";

export const runtime = "nodejs";
export const alt = "Libertas - Freedom Tech Signal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Read logo at module level (runs once at build time)
const logoData = readFileSync(
  join(process.cwd(), "public", "app-icon.png")
);
const logoSrc = `data:image/png;base64,${logoData.toString("base64")}`;

// Matrix characters for background effect
const MATRIX_CHARS =
  "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";

/**
 * Simple seeded PRNG for deterministic matrix rain per slug
 */
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

function generateMatrixChars(slug: string): { char: string; x: number; y: number; opacity: number }[] {
  const rand = seededRandom(slug);
  const chars: { char: string; x: number; y: number; opacity: number }[] = [];

  // Generate columns of falling characters
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

// Topic display colors
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

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
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
          Signal Not Found
        </div>
      ),
      { ...size }
    );
  }

  const matrixChars = generateMatrixChars(slug);

  // Pick font size based on title length
  const titleSize = post.title.length > 90 ? 36 : post.title.length > 60 ? 42 : 48;

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
        {/* Matrix rain background */}
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
                color: "#00ff41",
                fontSize: "16px",
                fontFamily: "monospace",
                opacity: mc.opacity,
              }}
            >
              {mc.char}
            </div>
          ))}
        </div>

        {/* Gradient overlay to make text readable */}
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

        {/* Content */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            padding: "48px 60px",
            height: "100%",
          }}
        >
          {/* Header: Logo + Brand */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
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
          </div>

          {/* Green accent line */}
          <div
            style={{
              width: "80px",
              height: "3px",
              backgroundColor: "#00ff41",
              marginTop: "24px",
              borderRadius: "2px",
              display: "flex",
            }}
          />

          {/* Title */}
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
                color: "#e0e0e0",
                fontSize: `${titleSize}px`,
                fontWeight: 700,
                lineHeight: 1.25,
                maxWidth: "1000px",
                display: "flex",
              }}
            >
              {post.title}
            </div>
          </div>

          {/* Bottom bar: Topics + URL */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* Topics */}
            <div style={{ display: "flex", gap: "10px" }}>
              {post.topics.slice(0, 3).map((topic) => {
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

            {/* URL */}
            <span style={{ color: "#868686", fontSize: "16px" }}>
              libertas.fgu.tech
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}
