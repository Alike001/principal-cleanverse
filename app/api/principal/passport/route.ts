import {
  loadPassport,
  PrincipalPassportInputError,
} from "@/lib/principal/passport.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return Response.json({ error: "Registry and passport ID are required." }, { status: 400 });
  }

  const registry = (body as { registry?: unknown }).registry;
  const passportId = (body as { passportId?: unknown }).passportId;
  if (typeof registry !== "string" || typeof passportId !== "string") {
    return Response.json({ error: "Registry and passport ID must be strings." }, { status: 400 });
  }

  try {
    return Response.json(await loadPassport(registry, passportId));
  } catch (error) {
    if (error instanceof PrincipalPassportInputError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    return Response.json(
      { error: "Live Monad Passport lookup is unavailable. No authority is assumed." },
      { status: 503 },
    );
  }
}
