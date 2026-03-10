import { ImageResponse } from "next/og";

export const runtime = "edge";

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

export async function GET(): Promise<ImageResponse> {
  const notoSansJP = await fetch(
    "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&display=swap"
  ).then((res) => res.text());

  const fontUrl = notoSansJP.match(
    /src: url\((.+?)\) format\('woff2'\)/
  )?.[1];

  const fontData = fontUrl
    ? await fetch(fontUrl).then((res) => res.arrayBuffer())
    : undefined;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
          fontFamily: '"Noto Sans JP", sans-serif',
        }}
      >
        <p
          style={{
            fontSize: 180,
            fontWeight: 700,
            // primary(hsl(200,60%,55%)) を20%透過した近似色
            color: "rgba(61, 171, 214, 0.2)",
            margin: 0,
            lineHeight: 1,
          }}
        >
          404
        </p>
        <p
          style={{
            fontSize: 40,
            fontWeight: 700,
            color: "#171717",
            marginTop: 16,
          }}
        >
          ページが見つかりません
        </p>
        <p
          style={{
            fontSize: 24,
            color: "#737373",
            marginTop: 8,
          }}
        >
          お探しのページは存在しないか、移動した可能性があります。
        </p>
      </div>
    ),
    {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      ...(fontData && {
        fonts: [
          {
            name: "Noto Sans JP",
            data: fontData,
            style: "normal",
            weight: 700,
          },
        ],
      }),
    }
  );
}
