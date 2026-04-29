import photographyImg from "@/assets/service-photography.jpg";
import ceramicsImg from "@/assets/service-ceramics.jpg";
import paintingImg from "@/assets/service-painting.jpg";
import musicImg from "@/assets/service-music.jpg";
import danceImg from "@/assets/service-dance.jpg";
import floralImg from "@/assets/service-floral.jpg";

export const SERVICE_IMAGES: Record<string, string> = {
  "a1b2c3d4-0001-4000-8000-000000000001": photographyImg,
  "a1b2c3d4-0002-4000-8000-000000000002": ceramicsImg,
  "a1b2c3d4-0003-4000-8000-000000000003": paintingImg,
  "a1b2c3d4-0004-4000-8000-000000000004": musicImg,
  "a1b2c3d4-0005-4000-8000-000000000005": danceImg,
  "a1b2c3d4-0006-4000-8000-000000000006": floralImg,
};

export const CATEGORY_ICONS: Record<string, string> = {
  Photography: "📷",
  Ceramics: "🏺",
  Painting: "🎨",
  Music: "🎵",
  Movement: "🤸",
  "Floral Design": "🌿",
};

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}
