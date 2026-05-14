import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { dirname } from "node:path";
import { spawnSync } from "node:child_process";

const require = createRequire(import.meta.url);
const root = dirname(require.resolve("../package.json"));

const archByNodeArch = {
  arm: "arm",
  arm64: "arm64",
  ia32: "ia32",
  loong64: "loong64",
  mips64el: "mips64el",
  ppc64: "ppc64",
  riscv64: "riscv64",
  s390x: "s390x",
  x64: "x64",
};

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function resolvePackageJson(packageName) {
  try {
    return require.resolve(`${packageName}/package.json`, { paths: [root] });
  } catch {
    return undefined;
  }
}

function installed(packageName) {
  return Boolean(resolvePackageJson(packageName));
}

function packageJson(packageName) {
  const packageJsonPath = resolvePackageJson(packageName);
  if (!packageJsonPath || !existsSync(packageJsonPath)) {
    throw new Error(`Run npm install first; ${packageName} is not installed.`);
  }

  return readJson(packageJsonPath);
}

function isMusl() {
  if (process.platform !== "linux") {
    return false;
  }

  const report = process.report?.getReport?.();
  if (report?.header && !report.header.glibcVersionRuntime) {
    return true;
  }

  return false;
}

function esbuildPackageName() {
  const arch = archByNodeArch[process.arch];
  if (!arch) {
    return undefined;
  }

  if (process.platform === "darwin" || process.platform === "linux") {
    return `@esbuild/${process.platform}-${arch}`;
  }

  return undefined;
}

function rollupPackageName() {
  const arch = archByNodeArch[process.arch];
  if (!arch) {
    return undefined;
  }

  if (process.platform === "darwin") {
    return `@rollup/rollup-darwin-${arch}`;
  }

  if (process.platform === "linux") {
    return `@rollup/rollup-linux-${arch}-${isMusl() ? "musl" : "gnu"}`;
  }

  return undefined;
}

function nativeDependency(dependencyName, packageName) {
  if (!packageName) {
    return undefined;
  }

  const dependencyPackage = packageJson(dependencyName);
  const version = dependencyPackage.optionalDependencies?.[packageName];
  if (!version) {
    throw new Error(`${dependencyName} does not declare ${packageName} as an optional dependency.`);
  }

  return `${packageName}@${version}`;
}

const requiredPackages = [
  nativeDependency("esbuild", esbuildPackageName()),
  nativeDependency("rollup", rollupPackageName()),
].filter(Boolean);

const missingPackages = requiredPackages.filter((packageSpec) => {
  const packageName = packageSpec.slice(0, packageSpec.lastIndexOf("@"));
  return !installed(packageName);
});

if (missingPackages.length === 0) {
  console.log("Native optional dependencies are already installed for this platform.");
  process.exit(0);
}

console.log(`Installing missing native optional dependencies: ${missingPackages.join(", ")}`);

const result = spawnSync(
  "npm",
  ["install", "--no-save", "--include=optional", ...missingPackages],
  {
    cwd: root,
    stdio: "inherit",
  },
);

process.exit(result.status ?? 1);
