import { consola } from 'consola';
import { $ } from 'execa';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { cpRf, exists, rmrf } from './fsutils';
import { applyPatches, copyLocalizedFiles } from './localize';
import { buildDir, rootDir } from './workspace';

export default async function () {
  consola.start('Synchronize git submodule...');
  await syncSubmodule();

  consola.start('Initialize build directory...');
  await initBuildDir();

  consola.start('Copy localized files...');
  await copyLocalizedFiles();

  consola.start('Apply patches...');
  await applyPatches();
}

async function syncSubmodule() {
  const sh = $({ cwd: rootDir, verbose: 'short' });
  await sh`git submodule sync`;
  await sh`git submodule update --init`;
}

async function initBuildDir() {
  await rmrf(buildDir);
  await mkdir(buildDir, { recursive: true });
  await cpRf(resolve(rootDir, 'origin'), buildDir);
  await cpRf(resolve(rootDir, '.bazelrc'), resolve(buildDir, '.bazelrc.user'));
}
