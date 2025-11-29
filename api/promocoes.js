import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.NEON_DB_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  if (req.method === "GET") {
    const result = await pool.query(`
      SELECT 
        promocoes.id,
        promocoes.tipo,
        promocoes.valor,
        promocoes.data_fim,
        produtos.nome AS nome_produto
      FROM promocoes
      JOIN produtos ON produtos.id = promocoes.produto_id
      ORDER BY promocoes.id DESC
    `);
    res.status(200).json(result.rows);
  }

  if (req.method === "POST") {
    const { produto_id, tipo, valor, data_fim } = req.body;
    if (!produto_id || !tipo || !valor || !data_fim) {
      return res.status(400).json({ error: "Preencha todos os campos!" });
    }

    const result = await pool.query(
      `INSERT INTO promocoes (produto_id, tipo, valor, data_fim)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [produto_id, tipo, valor, data_fim]
    );

    res.status(201).json(result.rows[0]);
  }

  if (req.method === "DELETE") {
    const { id } = req.query;
    await pool.query("DELETE FROM promocoes WHERE id = $1", [id]);
    res.status(204).end();
  }
}