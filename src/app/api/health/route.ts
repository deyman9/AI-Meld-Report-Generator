/**
 * Health Check Endpoint
 * 
 * Used by Railway and other infrastructure for health monitoring.
 * Simple health check that always returns 200 OK if the app is running.
 */

import { NextResponse } from "next/server";

interface HealthResponse {
  status: "ok";
  timestamp: string;
  version: string;
}

export async function GET(): Promise<NextResponse<HealthResponse>> {
  const response: HealthResponse = {
    status: "ok",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "0.1.0",
  };
  
  return NextResponse.json(response, { status: 200 });
}
