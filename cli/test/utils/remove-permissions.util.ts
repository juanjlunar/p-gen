import { existsSync } from 'fs';
import { rm } from 'fs/promises';
import { join } from 'path';

export async function removePermissions() {
  const path = join(process.cwd(), 'permissions.json');

  if (!existsSync(path)) {
    return;
  }

  await rm(join(process.cwd(), 'permissions.json'));
}
