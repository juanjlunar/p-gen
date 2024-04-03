import { UnknownError, captureTestError } from './capture-test-error';

class CustomError {}

describe('captureTestError', () => {
  describe('when the function passed as argument does not throw or reject', () => {
    it('should throw with UnknownError', async () => {
      try {
        await captureTestError(() => {
          return true;
        });
      } catch (error) {
        expect(error).toBeInstanceOf(UnknownError);
      }
    });
  });

  describe('otherwise it should return the rejected or throwed error', () => {
    it('should throw with UnknownError', async () => {
      const error = await captureTestError(async () => {
        await Promise.reject(new CustomError());
      });

      expect(error).toBeInstanceOf(CustomError);
    });
  });
});
