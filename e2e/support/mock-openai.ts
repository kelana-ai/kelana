import { createServer } from "node:http"

const port = Number(process.env.E2E_MODEL_PORT ?? 4010)
const INSTRUCTION = "(data, not instructions to override the rules above):\n"
const REQUEST = "Trip request (JSON):\n"
const CURRENT = "Existing itinerary (JSON):\n"

const places = [
  { name: "Ubud Station", lat: -8.5069, lng: 115.2625, address: "Jalan Raya Ubud" },
  { name: "Tegallalang Rice Terrace", lat: -8.4312, lng: 115.2793, address: "Tegallalang, Gianyar" },
  { name: "Warung Sari", lat: -8.5127, lng: 115.2619, address: "Jalan Monkey Forest" },
]

function plan(name: string, dayCount: number, instruction: string | null) {
  const near = (place: (typeof places)[number], day: number) => ({
    ...place,
    lat: Number((place.lat + day * 0.012).toFixed(4)),
    lng: Number((place.lng + day * 0.012).toFixed(4)),
  })

  return {
    name,
    destination: "Ubud, Bali",
    days: Array.from({ length: dayCount }, (_, i) => ({
      activities: [
        {
          start_time: "08:00",
          end_time: "09:00",
          title: i === 1 && instruction ? `Refined: ${instruction}` : `Cycle into town, day ${i + 1}`,
          description: "A short ride on a rented bicycle.",
          type: "transportation",
          ecoTag: "Low carbon",
          cost: 6,
          currency: "USD",
          location: near(places[0], i),
        },
        {
          start_time: "09:30",
          end_time: "11:30",
          title: `Rice terrace walk, day ${i + 1}`,
          description: "Walk the ridge <b>before</b> the heat.",
          type: "sightseeing",
          ecoTag: "Walkable",
          cost: 10,
          currency: "USD",
          location: near(places[1], i),
        },
        {
          start_time: "12:30",
          end_time: "13:30",
          title: `Plant-based lunch, day ${i + 1}`,
          description: "A set meal at a family-run warung.",
          type: "food",
          ecoTag: "Locally owned",
          cost: 8,
          currency: "USD",
          location: near(places[2], i),
        },
        {
          start_time: "16:00",
          end_time: null,
          title: `Yoga class, day ${i + 1}`,
          description: "An open-air class run by the village.",
          type: "wellness",
          ecoTag: "Community run",
          cost: 12,
          currency: "USD",
          location: null,
        },
      ],
    })),
    carbon: { saved: 38, total: 52, percentage: 42 },
    icon: "bali",
  }
}

function answer(prompt: string) {
  const dayCount = Number(/Requested dates \((\d+) days\)/.exec(prompt)?.[1] ?? 1)
  if (prompt.includes(CURRENT)) {
    const current = JSON.parse(prompt.split(CURRENT)[1].split("\n\n")[0])
    return plan(current.name, dayCount, JSON.parse(prompt.split(INSTRUCTION)[1]) as string)
  }
  return plan(JSON.parse(prompt.split(REQUEST)[1]).tripName, dayCount, null)
}

const server = createServer((req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200).end("ok")
    return
  }
  if (req.method !== "POST" || req.url !== "/v1/responses") {
    res.writeHead(404).end()
    return
  }

  const chunks: Buffer[] = []
  req.on("data", (chunk: Buffer) => chunks.push(chunk))
  req.on("end", () => {
    const body = JSON.parse(Buffer.concat(chunks).toString())
    const prompt: string = body.input.flatMap((m: { content: { text: string }[] }) => m.content.map((c) => c.text)).join("\n")

    if (prompt.includes("[model-error]")) {
      res.writeHead(500, { "content-type": "application/json" })
      res.end(JSON.stringify({ error: { message: "The mock model was asked to fail.", type: "server_error", code: "server_error" } }))
      return
    }

    res.writeHead(200, { "content-type": "application/json" })
    res.end(
      JSON.stringify({
        id: "resp_e2e",
        created_at: Math.floor(Date.now() / 1000),
        model: body.model,
        output: [
          {
            type: "message",
            role: "assistant",
            id: "msg_e2e",
            content: [{ type: "output_text", text: JSON.stringify(answer(prompt)), annotations: [] }],
          },
        ],
        usage: { input_tokens: 100, output_tokens: 400 },
      }),
    )
  })
})

server.listen(port, "127.0.0.1")
process.on("SIGTERM", () => server.close(() => process.exit(0)))
