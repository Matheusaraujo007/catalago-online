// api/itens_venda.js
import { Client } from "pg";

export default async function handler(req, res) {
  const client = new Client({
    connectionString: process.env.NEON_DB_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  try {
    if (req.method === "GET") {
      const { venda_id } = req.query;
      if (!venda_id) return res.status(400).json({ message: "venda_id é obrigatório" });

      const result = await client.query(`
        SELECT i.*, p.nome AS produto_nome, p.imagem_base64
        FROM itens_venda i
        LEFT JOIN produtos p ON i.produto_id = p.id
        WHERE venda_id = $1
      `, [venda_id]);

      return res.status(200).json(result.rows);
    } else {
      res.setHeader("Allow", ["GET"]);
      return res.status(405).end(`Método ${req.method} não permitido`);
    }
  } catch (error) {
    console.error("Erro em /api/itens_venda:", error);
    return res.status(500).json({ message: "Erro interno", error: error.message });
  } finally {
    await client.end();
  }
}