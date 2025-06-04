import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyJwt } from "@/utils/jwt";
import { cookies } from "next/headers";

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

    console.log("Decoded token:", decoded);

    let orderData;
    try {
      const rawBody = await request.text();
      if (!rawBody) {
        throw new Error("Empty request body");
      }
      orderData = JSON.parse(rawBody);
    } catch (error) {
      console.error("[Order API Error]: JSON parsing error:", error);
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: "Failed to parse request body",
        },
        { status: 400 }
      );
    }

    const { deliveryInfo, paymentMethod, items, totalAmount, promoCode } =
      orderData;

    // Validate required fields
    if (!deliveryInfo || !paymentMethod || !items || !totalAmount) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          details:
            "deliveryInfo, paymentMethod, items, and totalAmount are required",
        },
        { status: 400 }
      );
    }

    // Validate items
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          error: "Invalid items",
          details: "Items must be a non-empty array",
        },
        { status: 400 }
      );
    }

    // Validate each item
    for (const item of items) {
      if (!item.id || !item.quantity || !item.price) {
        return NextResponse.json(
          {
            error: "Invalid item data",
            details: "Each item must have id, quantity, and price",
          },
          { status: 400 }
        );
      }
    }

    // Validate delivery info
    if (
      !deliveryInfo.address ||
      !deliveryInfo.city ||
      !deliveryInfo.region ||
      !deliveryInfo.postalCode
    ) {
      return NextResponse.json(
        {
          error: "Invalid delivery information",
          details: "All delivery fields are required",
        },
        { status: 400 }
      );
    }

    try {
      // Create delivery record
      const delivery = await prisma.delivery.create({
        data: {
          serviceName: "Standard Delivery",
          address: deliveryInfo.address,
          city: deliveryInfo.city,
          region: deliveryInfo.region,
          postalCode: deliveryInfo.postalCode,
          deliveryStatus: "Pending",
          trackingNumber: `TRK${Date.now()}`,
          estimatedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      // Create order
      const order = await prisma.order.create({
        data: {
          user: {
            connect: {
              email: decoded.email,
            },
          },
          delivery: {
            connect: {
              id: delivery.id,
            },
          },
          totalPrice: totalAmount,
          status: "Pending",
          payment: {
            create: {
              method: paymentMethod,
              transactionId: `TRX${Date.now()}`,
              amount: totalAmount,
              paymentDate: new Date(),
              paymentStatus: "Pending",
            },
          },
          orderItems: {
            create: items.map((item) => ({
              productId: item.id,
              quantity: item.quantity,
              pricePerUnit: item.price,
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
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
          payment: true,
        },
      });

      return NextResponse.json(order);
    } catch (error) {
      console.error("[Database Error]:", error);
      return NextResponse.json(
        {
          error: "Database operation failed",
          details: error.message,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[Order API Error]:", error);
    return NextResponse.json(
      {
        error: "Failed to create order",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
