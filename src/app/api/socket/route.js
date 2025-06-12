// src/app/api/socket/route.js

import { NextResponse } from "next/server";
import { initSocket } from "@/lib/socketServer";

export async function GET(req) {
  try {
    if (!global.io) {
      const server = req.socket?.server;

      if (!server) {
        throw new Error("Server instance not found");
      }

      global.io = initSocket(server);

      // Wait for socket server to be ready
      await new Promise((resolve) => {
        if (global.io) {
          resolve();
        } else {
          setTimeout(resolve, 1000);
        }
      });
    }

    return NextResponse.json({
      message: "Socket initialized",
      status: "success",
    });
  } catch (error) {
    console.error("Socket initialization error:", error);
    return NextResponse.json(
      {
        error: "Failed to initialize socket",
        details: error.message,
      },
      {
        status: 500,
      }
    );
  }
}
