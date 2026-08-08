import { getMonadPrincipalStatus } from "@/lib/cleanverse/monad-status.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return Response.json(await getMonadPrincipalStatus());
  } catch {
    return Response.json(
      { error: "Cleanverse status is temporarily unavailable. No transfer authority is assumed." },
      { status: 503 },
    );
  }
}
