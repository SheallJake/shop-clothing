import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request) {
  try {
    const data = await request.json();
    const signature = request.headers.get("x-sign");

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.MONOBANK_API_KEY)
      .update(JSON.stringify(data))
      .digest("hex");

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Find order by invoice ID
    const order = await prisma.order.findFirst({
      where: {
        payment: {
          transactionId: data.invoiceId,
        },
      },
      include: {
        user: true,
        orderItems: true,
        payment: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const paymentStatus = data.status === "success" ? "Paid" : "Failed";

    // First update the payment status
    await prisma.payment.update({
      where: { id: order.payment.id },
      data: {
        paymentStatus,
        paymentDate: new Date(),
      },
    });

    // Then update the order status
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: paymentStatus === "Paid" ? "Processing" : "Payment Failed",
      },
      include: {
        payment: true,
      },
    });

    // If payment is successful, clear the user's cart
    if (paymentStatus === "Paid") {
      await prisma.cartItem.deleteMany({
        where: {
          userId: order.user.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("[Webhook Error]:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}
