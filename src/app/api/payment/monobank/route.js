import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyJwt } from "@/utils/jwt";

export async function POST(request) {
  let order = null;
  let delivery = null;
  let payment = null;

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

    // Validate required environment variables
    if (!process.env.MONOBANK_API_KEY) {
      console.error("MONOBANK_API_KEY is not set");
      return NextResponse.json(
        { error: "Payment service configuration error" },
        { status: 500 }
      );
    }

    if (!process.env.NEXT_PUBLIC_BASE_URL) {
      console.error("NEXT_PUBLIC_BASE_URL is not set");
      return NextResponse.json(
        { error: "Payment service configuration error" },
        { status: 500 }
      );
    }

    // Ensure NEXT_PUBLIC_BASE_URL has the correct format
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL.startsWith("http")
      ? process.env.NEXT_PUBLIC_BASE_URL
      : `https://${process.env.NEXT_PUBLIC_BASE_URL}`;

    // Validate input data
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    if (!deliveryInfo || !deliveryInfo.city || !deliveryInfo.warehouse) {
      return NextResponse.json(
        { error: "Invalid delivery information" },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Invalid order items" },
        { status: 400 }
      );
    }

    // Validate each item
    for (const item of items) {
      if (!item.productId || !item.quantity || !item.pricePerUnit) {
        return NextResponse.json(
          { error: "Invalid item data", item },
          { status: 400 }
        );
      }
    }

    console.log("Creating payment record with amount:", amount);
    // Create payment record
    payment = await prisma.payment.create({
      data: {
        method: "card",
        transactionId: `TRX${Date.now()}`,
        amount: amount,
        paymentDate: new Date(),
        paymentStatus: "Pending",
      },
    });

    console.log("Creating delivery record");
    // Create delivery record
    delivery = await prisma.delivery.create({
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

    console.log("Creating order record");
    // Create order with pending status
    order = await prisma.order.create({
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
                id: parseInt(item.productId),
              },
            },
            quantity: item.quantity,
            pricePerUnit: item.pricePerUnit,
          })),
        },
        ...(promoCode && {
          promoCode: {
            connect: {
              id: parseInt(promoCode),
            },
          },
        }),
      },
    });

    console.log("Creating Monobank invoice");
    // Create Monobank invoice
    const monobankRequestData = {
      amount: amount * 100, // Convert to kopiykas
      ccy: 980, // UAH
      merchantPaymInfo: {
        reference: order.id.toString(),
        destination: "Payment for order",
        basketOrder: items.map((item) => ({
          name: item.name,
          qty: item.quantity,
          sum: item.pricePerUnit * item.quantity * 100,
          icon: item.image || "", // Add image URL to each item
        })),
      },
      redirectUrl: `${baseUrl}/order/success?orderId=${order.id}`,
      webHookUrl: `${baseUrl}/api/payment/monobank/webhook`,
      validity: 3600,
    };

    console.log(
      "Monobank request data:",
      JSON.stringify(monobankRequestData, null, 2)
    );

    const monobankResponse = await fetch(
      "https://api.monobank.ua/api/merchant/invoice/create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Token": process.env.MONOBANK_API_KEY,
        },
        body: JSON.stringify(monobankRequestData),
      }
    );

    if (!monobankResponse.ok) {
      const errorData = await monobankResponse.json();
      console.error("Monobank API error:", errorData);

      // If Monobank invoice creation fails, delete the order and related records
      if (order) {
        try {
          // First delete order items
          await prisma.orderItem.deleteMany({
            where: { orderId: order.id },
          });

          // Then delete the order
          await prisma.order.delete({
            where: { id: order.id },
          });
        } catch (error) {
          console.error("Error deleting order:", error);
        }
      }

      if (delivery) {
        try {
          await prisma.delivery.delete({
            where: { id: delivery.id },
          });
        } catch (error) {
          console.error("Error deleting delivery:", error);
        }
      }

      if (payment) {
        try {
          await prisma.payment.delete({
            where: { id: payment.id },
          });
        } catch (error) {
          console.error("Error deleting payment:", error);
        }
      }

      throw new Error(
        `Failed to create Monobank invoice: ${errorData.errorDescription || "Unknown error"}`
      );
    }

    const monobankData = await monobankResponse.json();
    console.log("Monobank response:", monobankData);

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
      { error: "Failed to create payment", details: error.message },
      { status: 500 }
    );
  }
}
