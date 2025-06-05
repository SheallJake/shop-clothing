// src/app/api/socket/route.js

import { NextResponse } from "next/server";
import { initSocket } from "@/lib/socketServer";

export async function GET(req) {
  if (!global.io) {
    const server = res.socket?.server;

    if (server) {
      global.io = initSocket(server);
    }
  }
  return NextResponse.json({ message: "Socket initialized" });
}
