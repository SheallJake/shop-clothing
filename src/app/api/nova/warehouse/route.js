export async function POST(req) {
  const apiKey = process.env.NOVA_API_KEY;
  const { cityRef } = await req.json();

  const res = await fetch("https://api.novaposhta.ua/v2.0/json/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      apiKey,
      modelName: "Address",
      calledMethod: "getWarehouses",
      methodProperties: { CityRef: cityRef },
    }),
  });

  const data = await res.json();
  return Response.json(data);
}
