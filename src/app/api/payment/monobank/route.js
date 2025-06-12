import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyJwt } from "@/utils/jwt";

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyJwt(token.value);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { amount, deliveryInfo, items, promoCode } = await request.json();

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        method: "card",
        transactionId: `TRX${Date.now()}`,
        amount: amount,
        paymentDate: new Date(),
        paymentStatus: "Pending",
      },
    });

    // Create delivery record
    const delivery = await prisma.delivery.create({
      data: {
        address: deliveryInfo.warehouse,
        city: deliveryInfo.city,
        region: "Nova Poshta",
        postalCode: "00000",
        serviceName: "Nova Poshta",
        trackingNumber: `NP${Date.now()}`,
        deliveryStatus: "Pending",
        estimatedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Create order with pending status
    const order = await prisma.order.create({
      data: {
        user: {
          connect: {
            id: decoded.userId,
          },
        },
        delivery: {
          connect: {
            id: delivery.id,
          },
        },
        payment: {
          connect: {
            id: payment.id,
          },
        },
        totalPrice: amount,
        status: "Pending",
        orderItems: {
          create: items.map((item) => ({
            product: {
              connect: {
                id: item.productId,
              },
            },
            quantity: item.quantity,
            pricePerUnit: item.pricePerUnit,
          })),
        },
        ...(promoCode && {
          promoCode: {
            connect: {
              code: promoCode,
            },
          },
        }),
      },
    });

    // Create Monobank invoice
    const monobankResponse = await fetch(
      "https://api.monobank.ua/api/merchant/invoice/create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Token": process.env.MONOBANK_API_KEY,
        },
        body: JSON.stringify({
          amount: amount * 100, // Convert to kopiykas
          ccy: 980, // UAH
          merchantPaymInfo: {
            reference: order.id.toString(),
            destination: "Payment for order",
            basketOrder: items.map((item) => ({
              name: item.name,
              qty: item.quantity,
              sum: item.pricePerUnit * item.quantity * 100,
            })),
          },
          redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/order/success?orderId=${order.id}`,
          webHookUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/monobank/webhook`,
          validity: 3600,
        }),
      }
    );

    if (!monobankResponse.ok) {
      // If Monobank invoice creation fails, delete the order and related records
      await prisma.order.delete({
        where: { id: order.id },
      });
      await prisma.delivery.delete({
        where: { id: delivery.id },
      });
      await prisma.payment.delete({
        where: { id: payment.id },
      });

      throw new Error("Failed to create Monobank invoice");
    }

    const monobankData = await monobankResponse.json();

    // Update payment with Monobank invoice ID
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        transactionId: monobankData.invoiceId,
      },
    });

    return NextResponse.json({
      pageUrl: monobankData.pageUrl,
      orderId: order.id,
    });
  } catch (error) {
    console.error("[Payment API Error]:", error);
    return NextResponse.json(
      { error: "Failed to create payment", details: error },
      { status: 500 }
    );
  }
}
