const ADDRESS_PATTERN = /^0x[0-9a-fA-F]{40}$/;
const PASSPORT_ID_PATTERN = /^[1-9]\d*$/;

export function createPassportLink(origin: string, registry: string, passportId: string) {
  const normalizedOrigin = new URL(origin).origin;
  if (!ADDRESS_PATTERN.test(registry)) throw new Error("Registry must be a valid EVM address.");
  if (!PASSPORT_ID_PATTERN.test(passportId)) throw new Error("Passport ID must be a positive whole number.");
  const url = new URL("/workspace", normalizedOrigin);
  url.searchParams.set("registry", registry.toLowerCase());
  url.searchParams.set("passport", passportId);
  return url.toString();
}
