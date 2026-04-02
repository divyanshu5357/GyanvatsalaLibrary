import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ✅ correct path to client/dist
const frontendPath = path.join(__dirname, "../client/dist")

// serve frontend
app.use(express.static(frontendPath))

// fallback route (IMPORTANT)
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"))
})