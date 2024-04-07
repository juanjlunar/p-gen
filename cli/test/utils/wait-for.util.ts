/**
 * Wait until the callback resolves a value.
 *
 */
export async function waitFor(
  cb: () => Promise<void>,
  options = {} as WaitForOptions,
) {
  const { delay = 250 } = options;

  try {
    await cb();

    return;
  } catch (error) {
    // Do nothing
  }

  const timeout = setTimeout(async () => {
    await waitFor(cb, options);

    clearTimeout(timeout);
  }, delay);
}

export type WaitForOptions = {
  /**
   * Milliseconds.
   */
  delay?: number;
};
