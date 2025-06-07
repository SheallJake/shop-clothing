import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyJwtEdge } from "@/utils/jwtEdge";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyJwtEdge(token);
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get total orders
    const totalOrders = await prisma.order.count();

    // Get total users
    const totalUsers = await prisma.user.count();

    // Get total revenue
    const orders = await prisma.order.findMany({
      where: {
        status: "completed",
      },
      select: {
        totalPrice: true,
      },
    });
    const totalRevenue = orders.reduce(
      (sum, order) => sum + (order.totalPrice || 0),
      0
    );

    // Get average rating
    const reviews = await prisma.review.findMany({
      select: {
        rating: true,
      },
    });
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) /
          reviews.length
        : 0;

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Get top products
    const topProducts = await prisma.product.findMany({
      take: 5,
      include: {
        orderItems: {
          select: {
            quantity: true,
          },
        },
      },
      orderBy: {
        orderItems: {
          _count: "desc",
        },
      },
    });

    // Calculate total sales for each product
    const productsWithSales = topProducts.map((product) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      sales: product.orderItems.reduce((sum, item) => sum + item.quantity, 0),
    }));

    return NextResponse.json({
      totalOrders,
      totalUsers,
      totalRevenue,
      averageRating,
      recentOrders,
      topProducts: productsWithSales,
    });
  } catch (error) {
    console.error("Error in statistics API:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
