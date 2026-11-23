/**
 * Health check endpoint — Render polls this to determine service health.
 * Returns 200 with `status: "ok"` when the application is operational, 500
 * when the data directory is not writable/readable. Never exposes secrets.
 */
import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { DATA_DIR } from "@/lib/settings";

export async function GET() {
  let dataDirReady = true;
  let dataDirError = "";
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const probe = path.join(DATA_DIR, `.write-test-${process.pid}`);
    fs.writeFileSync(probe, "ok");
    fs.rmSync(probe, { force: true });
    if (!fs.existsSync(path.join(DATA_DIR, "settings.json"))) {
      dataDirReady = true; // first boot seeds the store
    }
  } catch (error) {
    dataDirReady = false;
    dataDirError = error instanceof Error ? error.message : String(error);
  }
  const status = dataDirReady ? "ok" : "degraded";
  return NextResponse.json({
    status,
    ok: dataDirReady,
    dataDir: DATA_DIR,
    environment: process.env.NODE_ENV || null,
    timestamp: new Date().toISOString(),
    ...(dataDirError ? { error: dataDirError } : {})
  }, { status: dataDirReady ? 200 : 500 });
}
