export class UnknownError extends Error {}

/**
 * Capture the error and return it to be used in jest assertions.
 *
 * @see https://github.com/jest-community/eslint-plugin-jest/blob/v27.2.3/docs/rules/no-conditional-expect.md
 */
export async function captureTestError<T>(func: () => unknown): Promise<T> {
  try {
    await func();

    throw new UnknownError();
  } catch (error) {
    return error as T;
  }
}
