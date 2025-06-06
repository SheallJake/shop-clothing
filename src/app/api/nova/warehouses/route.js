export const POST = async (request) => {
  try {
    const { cityRef } = await request.json();
    const apiKey = process.env.NOVA_API_KEY;

    const res = await fetch("https://api.novaposhta.ua/v2.0/json/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiKey,
        modelName: "Address",
        calledMethod: "getWarehouses",
        methodProperties: {
          CityRef: cityRef,
        },
      }),
    });

    const data = await res.json();
    return Response.json(data);
  } catch (error) {
    console.error("Error fetching warehouses:", error);
    return Response.json(
      { error: "Failed to fetch warehouses" },
      { status: 500 }
    );
  }
};
