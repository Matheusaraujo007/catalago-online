import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
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

  if (req.method === "PUT") {
    const { id, nome } = req.body;

    if (!id || !nome) {
      return res.status(400).json({ error: "ID e novo nome são obrigatórios" });
    }

    const result = await pool.query(
      "UPDATE categorias SET nome = $1 WHERE id = $2 RETURNING *",
      [nome, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Categoria não encontrada" });
    }

    res.status(200).json(result.rows[0]);
  }

  if (req.method === "DELETE") {
    const { id } = req.query;
    await pool.query("DELETE FROM categorias WHERE id = $1", [id]);
    res.status(204).end();
  }
}
