import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";
import { getPostBySlug } from "@/lib/posts";
import { getDigestBySlug } from "@/lib/posts";

const OG_SIZE = { width: 1200, height: 630 };
const TWITTER_SIZE = { width: 800, height: 800 };

// Read logo once at module level
const logoData = readFileSync(join(process.cwd(), "public", "app-icon.png"));
const logoSrc = `data:image/png;base64,${logoData.toString("base64")}`;

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

/**
 * Generate matrix rain as rows of text strings for efficient rendering.
 * Mixes ASCII symbols with katakana for a classic matrix aesthetic.
 */
const MATRIX_MIXED = "01<>|*+=@#アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン                                 ";

function generateMatrixRows(
  slug: string,
  width: number = 1200,
  height: number = 630,
): { text: string; opacity: number }[] {
  const charW = 10;
  const rowH = 22;
  // Generate 3x wider than needed so it always overflows
  const cols = Math.floor((width * 3) / charW);
  const numRows = Math.floor(height / rowH);

  let seed = 0;
  for (let i = 0; i < slug.length; i++) {
    seed = ((seed << 5) - seed + slug.charCodeAt(i)) | 0;
  }

  const rows: { text: string; opacity: number }[] = [];

  for (let row = 0; row < numRows; row++) {
    let line = "";
    for (let col = 0; col < cols; col++) {
      const h = ((seed ^ (row * 2654435761) ^ (col * 40503)) * 48271) >>> 0;
      if (h % 100 < 70) {
        line += " ";
      } else {
        const charIdx = ((h >> 3) ^ (h >> 7)) % MATRIX_MIXED.length;
        line += MATRIX_MIXED[charIdx];
      }
    }
    const rowFactor = row / numRows;
    rows.push({
      text: line,
      opacity: 0.1 + (1 - rowFactor) * 0.18,
    });
  }

  return rows;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Shared matrix rain + gradient background layer
 */
function MatrixBackground({
  slug,
  color,
  width = 1200,
  height = 630,
}: {
  slug: string;
  color: string;
  width?: number;
  height?: number;
}) {
  const matrixRows = generateMatrixRows(slug, width, height);

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: `${width}px`,
          height: `${height}px`,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-start",
          overflow: "hidden",
        }}
      >
        {matrixRows.map((row, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              color,
              fontSize: "14px",
              fontFamily: "monospace",
              opacity: row.opacity,
              whiteSpace: "pre",
              lineHeight: "22px",
              width: `${width}px`,
            }}
          >
            {row.text}
          </div>
        ))}
      </div>
      {/* Radial vignette: darkens center for content readability */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: `${width}px`,
          height: `${height}px`,
          background: "radial-gradient(ellipse 60% 55% at 50% 50%, rgba(10,10,10,0.88) 0%, rgba(10,10,10,0.45) 70%, rgba(10,10,10,0.05) 100%)",
          display: "flex",
        }}
      />
    </>
  );
}

function NotFoundImage(label: string) {
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
        {label} Not Found
      </div>
    ),
    { ...OG_SIZE }
  );
}

/**
 * Generate OG image for a post (signal)
 */
export async function renderPostOgImage(slug: string) {
  const post = getPostBySlug(slug);

  if (!post) return NotFoundImage("Signal");

  const titleSize =
    post.title.length > 90 ? 36 : post.title.length > 60 ? 42 : 48;

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
        <MatrixBackground slug={slug} color="#00ff41" />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            padding: "48px 60px",
            height: "100%",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <img
              src={logoSrc}
              width={44}
              height={44}
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

          {/* Accent line */}
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

          {/* Bottom bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
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
            <span style={{ color: "#868686", fontSize: "16px" }}>
              libertas.fgu.tech
            </span>
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE }
  );
}

/**
 * Generate OG image for a digest
 */
export async function renderDigestOgImage(slug: string) {
  const digest = getDigestBySlug(slug);

  if (!digest) return NotFoundImage("Digest");

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
        <MatrixBackground slug={slug} color="#ffb800" />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            padding: "48px 60px",
            height: "100%",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <img
              src={logoSrc}
              width={44}
              height={44}
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

          {/* Accent line */}
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

          {/* Bottom bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div
              style={{ display: "flex", gap: "10px", alignItems: "center" }}
            >
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
                {formatDate(digest.periodStart)} —{" "}
                {formatDate(digest.periodEnd)}
              </span>
              <span style={{ color: "#868686", fontSize: "16px" }}>
                libertas.fgu.tech
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE }
  );
}

/**
 * Square Twitter card image for a post (summary card)
 * Logo centered, "LIBERTAS" text, topic badges. No title (Twitter shows it from meta tags).
 */
export async function renderPostTwitterImage(slug: string) {
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
            fontSize: 28,
          }}
        >
          Signal Not Found
        </div>
      ),
      { ...TWITTER_SIZE }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: "#0a0a0a",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <MatrixBackground slug={slug} color="#00ff41" width={800} height={800} />

        {/* Content centered */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "40px",
            width: "100%",
            height: "100%",
            padding: "60px",
          }}
        >
          {/* Logo */}
          <img
            src={logoSrc}
            width={240}
            height={240}
            style={{ borderRadius: "16px" }}
          />

          {/* Brand text */}
          <span
            style={{
              color: "#00ff41",
              fontSize: "52px",
              fontWeight: 700,
              letterSpacing: "8px",
            }}
          >
            LIBERTAS
          </span>

          {/* Green accent line */}
          <div
            style={{
              width: "80px",
              height: "4px",
              backgroundColor: "#00ff41",
              borderRadius: "2px",
              display: "flex",
            }}
          />

          {/* Topic badges */}
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center", maxWidth: "700px" }}>
            {post.topics.slice(0, 4).map((topic) => {
              const color = TOPIC_COLORS[topic] || "#00ff41";
              return (
                <div
                  key={topic}
                  style={{
                    color,
                    fontSize: "24px",
                    fontWeight: 600,
                    border: `2px solid ${color}60`,
                    borderRadius: "10px",
                    padding: "10px 28px",
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
          <span style={{ color: "#868686", fontSize: "22px" }}>
            libertas.fgu.tech
          </span>
        </div>
      </div>
    ),
    { ...TWITTER_SIZE }
  );
}

/**
 * Square Twitter card image for a digest (summary card)
 * Logo centered with amber theme, "WEEKLY DIGEST" badge, topic badges.
 */
export async function renderDigestTwitterImage(slug: string) {
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
            fontSize: 28,
          }}
        >
          Digest Not Found
        </div>
      ),
      { ...TWITTER_SIZE }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: "#0a0a0a",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <MatrixBackground slug={slug} color="#ffb800" width={800} height={800} />

        {/* Content centered */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "36px",
            width: "100%",
            height: "100%",
            padding: "60px",
          }}
        >
          {/* Logo */}
          <img
            src={logoSrc}
            width={220}
            height={220}
            style={{ borderRadius: "16px" }}
          />

          {/* Brand text */}
          <span
            style={{
              color: "#00ff41",
              fontSize: "48px",
              fontWeight: 700,
              letterSpacing: "8px",
            }}
          >
            LIBERTAS
          </span>

          {/* Digest badge */}
          <div
            style={{
              color: "#ffb800",
              fontSize: "26px",
              fontWeight: 600,
              border: "2px solid #ffb80060",
              borderRadius: "10px",
              padding: "10px 32px",
              backgroundColor: "#ffb80020",
              display: "flex",
            }}
          >
            WEEKLY DIGEST
          </div>

          {/* Topic badges */}
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center", maxWidth: "700px" }}>
            {digest.topTopics.slice(0, 4).map((topic) => {
              const color = TOPIC_COLORS[topic] || "#00ff41";
              return (
                <div
                  key={topic}
                  style={{
                    color,
                    fontSize: "24px",
                    fontWeight: 600,
                    border: `2px solid ${color}60`,
                    borderRadius: "10px",
                    padding: "10px 28px",
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
          <span style={{ color: "#868686", fontSize: "22px" }}>
            libertas.fgu.tech
          </span>
        </div>
      </div>
    ),
    { ...TWITTER_SIZE }
  );
}
