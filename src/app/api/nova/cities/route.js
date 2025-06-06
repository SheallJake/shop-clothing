export const GET = async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get("search") || "";

    const apiKey = process.env.NOVA_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "API key is not configured" },
        { status: 500 }
      );
    }

    const res = await fetch("https://api.novaposhta.ua/v2.0/json/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiKey,
        modelName: "Address",
        calledMethod: "getCities",
        methodProperties: {
          FindByString: searchQuery,
          Limit: 20,
        },
      }),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return Response.json(data);
  } catch (error) {
    console.error("Error fetching cities:", error);
    return Response.json({ error: "Failed to fetch cities" }, { status: 500 });
  }
};
