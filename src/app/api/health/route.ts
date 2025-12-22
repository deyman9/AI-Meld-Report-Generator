/**
 * Health Check Endpoint
 * 
 * Used by Railway and other infrastructure for health monitoring.
 * Returns basic health status and can be extended to check database connectivity.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { existsSync } from "fs";
import { STORAGE_DIRS } from "@/lib/storage";

type CheckStatus = "ok" | "error";
type HealthStatus = "ok" | "degraded" | "error";

interface HealthResponse {
  status: HealthStatus;
  timestamp: string;
  version: string;
  checks: {
    database: CheckStatus;
    storage: CheckStatus;
  };
  uptime: number;
}

// Track server start time for uptime calculation
const startTime = Date.now();

export async function GET(): Promise<NextResponse<HealthResponse>> {
  let databaseStatus: CheckStatus = "ok";
  let storageStatus: CheckStatus = "ok";
  let status: HealthStatus = "ok";
  
  // Check database connectivity
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    databaseStatus = "error";
    status = "degraded";
  }
  
  // Check storage directory access
  try {
    if (!existsSync(STORAGE_DIRS.upload)) {
      storageStatus = "error";
      status = "degraded";
    }
  } catch {
    storageStatus = "error";
    status = "degraded";
  }
  
  const response: HealthResponse = {
    status,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "0.1.0",
    checks: {
      database: databaseStatus,
      storage: storageStatus,
    },
    uptime: Math.floor((Date.now() - startTime) / 1000),
  };
  
  // Return 503 if any critical services are down
  const statusCode = status === "ok" ? 200 : 503;
  
  return NextResponse.json(response, { status: statusCode });
}

