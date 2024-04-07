import { Test, TestingModule } from '@nestjs/testing';
import { UtilsService } from './utils.service';
import { writeFile, mkdir, rm, access } from 'fs/promises';
import { Mock } from 'vitest';
import { captureTestError } from '../common/utils/capture-test-error';
import { dirname } from 'path';

vi.mock('fs/promises');
vi.mock('path');

describe('UtilsService', () => {
  let service: UtilsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UtilsService],
    }).compile();

    service = module.get<UtilsService>(UtilsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('flattenObj', () => {
    describe('when the object has nested keys', () => {
      describe('when the first key starts with $', () => {
        it.todo('should return the first key with its value');
      });
    });
  });

  describe('writeFile', () => {
    describe('when the something wrong happens trying to write the dir or the file', () => {
      describe('when the directory exists before writing the file', () => {
        it('should remove the file if it was already written', async () => {
          (access as Mock).mockRejectedValue(undefined);

          (mkdir as Mock).mockRejectedValue(new Error('test-error'));

          const dirName = 'dir';

          (dirname as Mock).mockReturnValue(dirName);

          const error = await captureTestError<Error>(async () => {
            await service.writeFile(`${dirName}/file.txt`, 'buffer');
          });

          expect(error).toBeInstanceOf(Error);

          expect(error.message).toBe('test-error');

          expect(rm).toHaveBeenCalledWith(dirName, {
            recursive: true,
            force: true,
          });
        });
      });

      describe('otherwise', () => {
        it('should remove the entire directory', async () => {
          (access as Mock).mockResolvedValue(undefined);

          (mkdir as Mock).mockRejectedValue(new Error('test-error'));

          const dirName = 'dir';

          (dirname as Mock).mockReturnValue(dirName);

          const filePath = `${dirName}/file.txt`;

          const error = await captureTestError<Error>(async () => {
            await service.writeFile(filePath, 'buffer');
          });

          expect(error).toBeInstanceOf(Error);

          expect(error.message).toBe('test-error');

          expect(rm).toHaveBeenCalledWith(filePath, {
            recursive: true,
            force: true,
          });
        });
      });
    });

    describe('otherwise', () => {
      it('should resolve with undefined', async () => {
        (access as Mock).mockResolvedValue(undefined);

        (mkdir as Mock).mockResolvedValue(undefined);

        (writeFile as Mock).mockResolvedValue(undefined);

        const dirName = 'dir';

        const filePath = `${dirName}/file.txt`;

        const result = await service.writeFile(filePath, 'buffer');

        expect(result).toBeUndefined();
      });
    });
  });

  describe('fileOrDirExists', () => {
    describe('when the access module throws', () => {
      it('should return false', async () => {
        (access as Mock).mockRejectedValue(undefined);

        const result = await service.fileOrDirExists('path');

        expect(result).toBe(false);
      });
    });

    describe('otherwise', () => {
      it('should return true', async () => {
        (access as Mock).mockResolvedValue(true);

        const result = await service.fileOrDirExists('path');

        expect(result).toBe(true);
      });
    });
  });
});
