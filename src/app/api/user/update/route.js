import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyJwtEdge } from "@/utils/jwtEdge";
import bcrypt from "bcryptjs";

export async function PATCH(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyJwtEdge(token.value);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { name, phoneNumber, currentPassword, newPassword } =
      await request.json();

    // Get current user data
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        passwordHash: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prepare update data
    const updateData = {
      name: name || user.name,
      phoneNumber: phoneNumber || user.phoneNumber,
    };

    // If changing password
    if (newPassword) {
      // Verify current password
      const isValidPassword = await bcrypt.compare(
        currentPassword,
        user.passwordHash
      );
      if (!isValidPassword) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 400 }
        );
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(newPassword, salt);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        role: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("[User Update API Error]:", error);
    return NextResponse.json(
      {
        error: "Failed to update user profile",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
