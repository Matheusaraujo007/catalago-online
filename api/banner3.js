// pages/api/banner3.js
import { Client } from "pg";

export default async function handler(req, res) {
  const client = new Client({
    connectionString: process.env.NEON_DB_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  try {
    if (req.method === "GET") {
      const result = await client.query(
        "SELECT id, banner3, criado_em FROM banners ORDER BY criado_em DESC"
      );
      return res.status(200).json(result.rows);
    }

    if (req.method === "POST") {
      const { banner3 } = req.body;

      if (!banner3) {
        return res.status(400).json({ message: "Informe a URL do Banner 3." });
      }

      const result = await client.query(
        "INSERT INTO banners (banner3) VALUES ($1) RETURNING *",
        [banner3]
      );

      return res.status(201).json(result.rows[0]);
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Método ${req.method} não permitido`);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro no servidor", error: err.message });
  } finally {
    await client.end();
  }
}
