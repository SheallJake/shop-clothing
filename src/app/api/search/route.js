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

    // Prepare the search query with prefix matching and word stemming
    const searchQuery = query
      .trim()
      .split(/\s+/)
      .map((term) => `${term}:*`)
      .join(" & ");

    console.log("Processed search query:", searchQuery);

    // Build the SQL query with ranking and highlighting
    const sqlQuery = `
      WITH search_results AS (
        SELECT 
          p.id,
          p.name,
          p.description,
          p.brand,
          p.price,
          p."mainImage",
          p."galleryImages",
          p."stockQuantity",
          p.color,
          p.size,
          p."isDiscountActive",
          p."discountPrice",
          c.name as "categoryName",
          ts_rank_cd(p."searchVector", to_tsquery('russian', $1)) as rank,
          ts_headline('russian', p.name, to_tsquery('russian', $1), 'StartSel=<mark>,StopSel=</mark>,MaxFragments=1,MaxWords=30') as name_highlight,
          ts_headline('russian', p.description, to_tsquery('russian', $1), 'StartSel=<mark>,StopSel=</mark>,MaxFragments=1,MaxWords=30') as description_highlight
        FROM "Product" p
        LEFT JOIN "Category" c ON p."categoryId" = c.id
        WHERE p."searchVector" @@ to_tsquery('russian', $1)
        ${cursor ? `AND p.id > ${parseInt(cursor)}` : ""}
      )
      SELECT *
      FROM search_results
      ORDER BY rank DESC, id ASC
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
      nameHighlight: product.name_highlight,
      description: product.description,
      descriptionHighlight: product.description_highlight,
      brand: product.brand,
      price: product.price,
      image: product.mainImage,
      galleryImages: product.galleryImages,
      stockQuantity: product.stockQuantity,
      color: product.color,
      size: product.size,
      isDiscountActive: product.isDiscountActive || false,
      discountPrice: product.discountPrice || null,
      category: {
        name: product.categoryName,
      },
      rank: product.rank,
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
