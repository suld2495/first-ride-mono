const BUILD_NUMBER_PATTERN = /^\d+$/;

const parseBuildNumber = (buildNumber: string): number | null => {
  const normalizedBuildNumber = buildNumber.trim();

  if (!BUILD_NUMBER_PATTERN.test(normalizedBuildNumber)) {
    return null;
  }

  const parsedBuildNumber = Number(normalizedBuildNumber);

  return Number.isSafeInteger(parsedBuildNumber) && parsedBuildNumber > 0
    ? parsedBuildNumber
    : null;
};

export const isBuildNumberLower = (
  currentBuildNumber: string,
  minimumBuildNumber: number,
): boolean => {
  const parsedCurrentBuildNumber = parseBuildNumber(currentBuildNumber);

  if (
    parsedCurrentBuildNumber === null ||
    !Number.isSafeInteger(minimumBuildNumber) ||
    minimumBuildNumber <= 0
  ) {
    return false;
  }

  return parsedCurrentBuildNumber < minimumBuildNumber;
};
