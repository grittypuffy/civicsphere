import { NextRequest } from "next/server";
import { Language } from "./types";

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
    const backendApi = process.env.NEXT_PUBLIC_BACKEND_API;
    const newUrl = `${backendApi}/api/v1/auth/session/valid`;
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
