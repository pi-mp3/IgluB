import express from "express";
import cors from "cors";
import admin from "firebase-admin";

const app = express();
app.use(cors());
app.use(express.json());

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

app.get("/", (req, res) => {
  res.send("Servidor IGLU Backend funcionando 🔥");
});

// Ejemplo de endpoint protegido con Firebase Admin
app.get("/verify", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Token faltante" });

    const decoded = await admin.auth().verifyIdToken(token);
    res.json({ message: "Token válido", uid: decoded.uid });
  } catch (error) {
    res.status(401).json({ error: "Token inválido" });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🔥 Servidor corriendo en http://localhost:${PORT}`);
});
