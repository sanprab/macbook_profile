import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SCOTTIE_PIPPEN_PAGE = "https://alclaboratories.bandcamp.com/track/6-scottie-pippens";

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export async function GET(request: NextRequest) {
  const track = request.nextUrl.searchParams.get("track")?.trim();
  const artist = request.nextUrl.searchParams.get("artist")?.trim();

  if (!track || !artist || track.length > 100 || artist.length > 100) {
    return new NextResponse("Missing track details", { status: 400 });
  }

  if (track === "Scottie Pippen" && artist === "Curren$y") {
    const page = await fetch(SCOTTIE_PIPPEN_PAGE, { next: { revalidate: 0 } });
    const html = await page.text();
    const encodedStream = html.match(/https:\/\/t4\.bcbits\.com\/stream\/[^"\s]+mp3-128[^"\s]*/)?.[0];
    const streamUrl = encodedStream?.split("&quot;")[0].replaceAll("&amp;", "&");

    if (streamUrl) return NextResponse.redirect(streamUrl);
  } else {
    const search = async (query: string) => {
      const response = await fetch(
        `https://api.deezer.com/search/track?q=${encodeURIComponent(query)}`,
        { cache: "no-store" }
      );
      return response.json();
    };
    let data = await search(`${track} ${artist}`);
    if (!data.data?.length) data = await search(`${track} ${artist.split(" ")[0]}`);
    const targetTrack = normalize(track);
    const targetArtist = normalize(artist);
    const result = data.data?.find((candidate: { title?: string; artist?: { name?: string }; preview?: string }) =>
      normalize(candidate.title ?? "").startsWith(targetTrack) &&
      normalize(candidate.artist?.name ?? "").includes(targetArtist.slice(0, 5)) &&
      candidate.preview
    );

    if (result?.preview) return NextResponse.redirect(result.preview);
  }

  return new NextResponse("Preview unavailable", { status: 404 });
}
