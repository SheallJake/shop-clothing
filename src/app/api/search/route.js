import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const cursor = searchParams.get("cursor");
    const limit = parseInt(searchParams.get("limit") || "20");

    console.log("Search params:", { query, cursor, limit });

    if (!query) {
      return NextResponse.json({ products: [], nextCursor: null });
    }

    // Prepare the search query
    const searchQuery = query
      .trim()
      .split(/\s+/)
      .map((term) => `${term}:*`)
      .join(" & ");

    console.log("Processed search query:", searchQuery);

    // Build the SQL query
    const sqlQuery = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.brand,
        p.price,
        p.image,
        p."stockQuantity",
        p.color,
        p.size,
        c.name as "categoryName"
      FROM "Product" p
      LEFT JOIN "Category" c ON p."categoryId" = c.id
      WHERE p."searchVector" @@ to_tsquery('english', $1)
      ${cursor ? `AND p.id > ${parseInt(cursor)}` : ""}
      ORDER BY ts_rank(p."searchVector", to_tsquery('english', $1)) DESC, p.id ASC
      LIMIT ${limit + 1}
    `;

    console.log("SQL Query:", sqlQuery);

    // Execute the search query
    const products = await prisma.$queryRawUnsafe(sqlQuery, searchQuery);

    console.log("Found products:", products.length);

    // Check if there are more results
    const hasMore = products.length > limit;
    const results = hasMore ? products.slice(0, -1) : products;
    const nextCursor = hasMore ? results[results.length - 1].id : null;

    // Transform the results to match the expected format
    const formattedResults = results.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      brand: product.brand,
      price: product.price,
      image: product.image,
      stockQuantity: product.stockQuantity,
      color: product.color,
      size: product.size,
      category: {
        name: product.categoryName,
      },
    }));

    return NextResponse.json({
      products: formattedResults,
      nextCursor,
    });
  } catch (error) {
    console.error("Search error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    return NextResponse.json(
      {
        error: "Failed to perform search",
        details: error.message,
        type: error.name,
      },
      { status: 500 }
    );
  }
}
