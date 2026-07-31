const VERSION_PATTERN = /^v?(\d+(?:\.\d+)*)(?:[-+][0-9A-Za-z.-]+)?$/;

const parseVersion = (version: string): number[] | null => {
  const match = VERSION_PATTERN.exec(version.trim());

  if (!match?.[1]) {
    return null;
  }

  return match[1].split('.').map(Number);
};

export const isVersionLower = (
  currentVersion: string,
  latestVersion: string,
): boolean => {
  const currentParts = parseVersion(currentVersion);
  const latestParts = parseVersion(latestVersion);

  if (!currentParts || !latestParts) {
    return false;
  }

  const partCount = Math.max(currentParts.length, latestParts.length);

  for (let index = 0; index < partCount; index += 1) {
    const currentPart = currentParts[index] ?? 0;
    const latestPart = latestParts[index] ?? 0;

    if (currentPart !== latestPart) {
      return currentPart < latestPart;
    }
  }

  return false;
};
