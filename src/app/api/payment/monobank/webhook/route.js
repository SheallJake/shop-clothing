import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

// Добавляем обработку GET запросов для тестирования
export async function GET(request) {
  console.log("[Monobank Webhook] Test GET request received");
  return NextResponse.json({
    status: "Webhook endpoint is working",
    message: "This endpoint accepts POST requests from Monobank",
  });
}

export async function POST(request) {
  console.log("[Monobank Webhook] ====== Webhook Call Started ======");
  console.log(
    "[Monobank Webhook] Headers:",
    Object.fromEntries(request.headers.entries())
  );

  try {
    const data = await request.json();
    const signature = request.headers.get("x-sign");

    console.log(
      "[Monobank Webhook] Full request data:",
      JSON.stringify(data, null, 2)
    );
    console.log("[Monobank Webhook] Received signature:", signature);
    console.log(
      "[Monobank Webhook] MONOBANK_PUBLIC_KEY exists:",
      !!process.env.MONOBANK_PUBLIC_KEY
    );

    // Verify webhook signature using RSA
    const message = JSON.stringify(data);
    const signatureBuf = Buffer.from(signature, "base64");
    const publicKeyBuf = Buffer.from(process.env.MONOBANK_PUBLIC_KEY, "base64");

    const verify = crypto.createVerify("SHA256");
    verify.write(message);
    verify.end();

    const isValid = verify.verify(publicKeyBuf, signatureBuf);

    console.log("[Monobank Webhook] Signature verification result:", isValid);

    if (!isValid) {
      console.error("[Monobank Webhook] Invalid signature", {
        received: signature,
        message: message,
        publicKey: process.env.MONOBANK_PUBLIC_KEY?.substring(0, 50) + "...", // Показываем только начало ключа для безопасности
      });
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    console.log("[Monobank Webhook] Signature verified successfully");

    // Find order by invoice ID
    const order = await prisma.order.findFirst({
      where: {
        payment: {
          transactionId: data.invoiceId,
        },
      },
      include: {
        user: true,
        payment: true,
        promoCode: true,
        orderItems: true,
      },
    });

    if (!order) {
      console.error("[Monobank Webhook] Order not found", {
        invoiceId: data.invoiceId,
        searchQuery: {
          payment: {
            transactionId: data.invoiceId,
          },
        },
      });
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    console.log("[Monobank Webhook] Found order", {
      orderId: order.id,
      userId: order.user.id,
      currentStatus: order.status,
      paymentStatus: order.payment.paymentStatus,
    });

    const paymentStatus = data.status === "success" ? "Paid" : "Failed";
    console.log("[Monobank Webhook] Processing payment status", {
      paymentStatus,
      originalStatus: data.status,
    });

    // First update the payment status
    await prisma.payment.update({
      where: { id: order.payment.id },
      data: {
        paymentStatus,
        paymentDate: new Date(),
      },
    });

    console.log("[Monobank Webhook] Updated payment status");

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

    console.log("[Monobank Webhook] Updated order status", {
      orderId: updatedOrder.id,
      newStatus: updatedOrder.status,
      paymentStatus: updatedOrder.payment.paymentStatus,
    });

    let cartCleared = false;
    // If payment is successful, clear the user's cart
    if (paymentStatus === "Paid") {
      try {
        const deletedItems = await prisma.cart.deleteMany({
          where: {
            userId: order.user.id,
          },
        });
        cartCleared = true;
        console.log("[Monobank Webhook] Cleared user cart", {
          userId: order.user.id,
          deletedItemsCount: deletedItems.count,
        });

        // Update promo code usage count if promo code was used
        if (order.promoCode) {
          await prisma.promoCode.update({
            where: { id: order.promoCode.id },
            data: {
              usedCount: {
                increment: 1,
              },
            },
          });
          console.log("[Monobank Webhook] Updated promo code usage count", {
            promoCodeId: order.promoCode.id,
            promoCode: order.promoCode.code,
          });
        }
      } catch (error) {
        console.error(
          "[Monobank Webhook] Error processing post-payment tasks:",
          error
        );
        // Не прерываем выполнение, если не удалось выполнить пост-оплатные задачи
      }
    }

    console.log(
      "[Monobank Webhook] ====== Webhook Call Completed Successfully ======"
    );
    return NextResponse.json({
      success: true,
      order: updatedOrder,
      cartCleared,
    });
  } catch (error) {
    console.error("[Monobank Webhook] ====== Webhook Error ======", {
      error: error.message,
      stack: error.stack,
      data: error.data,
    });
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}
