export class CleanverseConfigurationError extends Error {
  name = "CleanverseConfigurationError";
}

export class CleanverseTransportError extends Error {
  name = "CleanverseTransportError";
}

export class CleanverseResponseError extends Error {
  name = "CleanverseResponseError";

  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
  }
}

export class CleanverseMalformedResponseError extends Error {
  name = "CleanverseMalformedResponseError";
}
