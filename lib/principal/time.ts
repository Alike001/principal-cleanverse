export function formatUnixTimestamp(value: string) {
  try {
    const timestamp = BigInt(value);
    const maxSafeUnixTimestamp = BigInt(Math.floor(Number.MAX_SAFE_INTEGER / 1000));
    if (timestamp < 0n || timestamp > maxSafeUnixTimestamp) return "Unrepresentable timestamp";
    return new Date(Number(timestamp) * 1000).toISOString().replace("T", " ").replace(".000Z", " UTC");
  } catch {
    return "Invalid timestamp";
  }
}
