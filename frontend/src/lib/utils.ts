import { NextRequest } from "next/server";
import { Language, PostData } from "./types";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const langs: Language[] = [
  { code: "ar", name: "Arabic" },
  { code: "bn", name: "Bengali" },
  { code: "de", name: "German" },
  { code: "el", name: "Greek" },
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "hi", name: "Hindi" },
  { code: "ht", name: "Haitian Creole" },
  { code: "it", name: "Italian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "pl", name: "Polish" },
  { code: "pa", name: "Punjabi" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "tl", name: "Filipino" },
  { code: "ur", name: "Urdu" },
  { code: "yi", name: "Yiddish" },
  { code: "zh", name: "Chinese" }
]

export const locales = langs.map(lang => lang.code);

export const isAuthenticated = async (req: NextRequest): Promise<boolean> => {
  const token = req.cookies.get('token');
  if (!token) {
    return false;
  }

  try {
    const backendApi = process.env.NEXT_PUBLIC_BACKEND_URL;
    const newUrl = `${backendApi}/api/v1/auth/session/is_valid`;
    const newReq = new Request(newUrl, req.clone());

    const res = await fetch(newReq, {
      signal: AbortSignal.timeout(30000),
    });

    if (res.status === 200) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      console.error('Request timeout while validating session');
      return false;
    }
    console.error('Error proxying request:', error);
    return false;
  }
}

export const getFeeds = async () => {
  const res = await fetch(`${BACKEND_URL}/api/v1/feed`, {
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) {
    throw new Error('Failed to fetch feed data');
  }
  const data: PostData[] = await res.json();
  return data;
}
