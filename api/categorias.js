import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Coloque sua URL do Neon no ambiente da Vercel
});

export default async function handler(req, res) {
  if (req.method === "GET") {
    const result = await pool.query("SELECT * FROM categorias ORDER BY id ASC");
    res.status(200).json(result.rows);
  }

  if (req.method === "POST") {
    const { nome } = req.body;
    if (!nome) return res.status(400).json({ error: "Nome é obrigatório" });

    const result = await pool.query(
      "INSERT INTO categorias (nome) VALUES ($1) RETURNING *",
      [nome]
    );
    res.status(201).json(result.rows[0]);
  }

  if (req.method === "DELETE") {
    const { id } = req.query;
    await pool.query("DELETE FROM categorias WHERE id = $1", [id]);
    res.status(204).end();
  }
}