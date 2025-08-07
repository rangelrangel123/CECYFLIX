const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 4000;

// Importar rutas y modelos
const peliculasRouter = require("./routers/peliculas");

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("✅ Conectado a MongoDB Atlas");

    // Rutas de películas
    app.use("/api/peliculas", peliculasRouter);

    // Ruta de recomendaciones IA
    app.post("/api/recomendaciones", async (req, res) => {
      const { prompt } = req.body;
      try {
        const response = await axios.post(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            model: "openrouter/cypher-alpha:free",
            messages: [{ role: "user", content: prompt }],
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );
        const recomendacion = response.data.choices[0].message.content;
        res.json({ recomendacion });
      } catch (error) {
        console.error("Error en la API:", error.response?.data || error.message);
        res.status(500).json({ error: "Error en el servidor proxy" });
      }
    });

    // Iniciar el servidor SOLO después de conectar a MongoDB
    app.listen(PORT, () => {
      console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Error al conectar a MongoDB:", err);
    process.exit(1);
  });