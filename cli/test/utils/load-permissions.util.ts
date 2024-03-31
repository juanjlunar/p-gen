import { readFile } from 'fs/promises';
import { join } from 'path';

export async function loadPermissions(fileName: string = 'permissions.json') {
  try {
    const rawText = await readFile(join(process.cwd(), fileName), 'utf-8');

    return rawText;
  } catch (error) {
    return '{}';
  }
}
