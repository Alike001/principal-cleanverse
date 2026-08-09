import {
  evaluatePrincipalPassport,
  PrincipalInputError,
} from "@/lib/principal/evaluate.server";

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
    return Response.json({ error: "Recipient and amount are required." }, { status: 400 });
  }

  const recipient = (body as { recipient?: unknown }).recipient;
  const amount = (body as { amount?: unknown }).amount;
  const registry = (body as { registry?: unknown }).registry;
  const passportId = (body as { passportId?: unknown }).passportId;
  if (typeof recipient !== "string" || typeof amount !== "string") {
    return Response.json({ error: "Recipient and amount must be strings." }, { status: 400 });
  }
  if (registry !== undefined && typeof registry !== "string") {
    return Response.json({ error: "Registry must be a string." }, { status: 400 });
  }
  if (passportId !== undefined && typeof passportId !== "string") {
    return Response.json({ error: "Passport ID must be a string." }, { status: 400 });
  }

  try {
    return Response.json(await evaluatePrincipalPassport(recipient.trim(), amount.trim(), {
      registry: registry?.trim(),
      passportId: passportId?.trim(),
    }));
  } catch (error) {
    if (error instanceof PrincipalInputError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    return Response.json(
      { error: "Live Monad evaluation is unavailable. No transfer authority is assumed." },
      { status: 503 },
    );
  }
}
