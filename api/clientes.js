import { db } from '../_lib/db'; // adapte ao seu banco

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { nome, telefone } = req.body;

    try {
      const result = await db.query(
        "INSERT INTO clientes (nome, telefone) VALUES ($1, $2) RETURNING id",
        [nome, telefone]
      );

      return res.status(200).json({ success: true, id: result.rows[0].id });
    } catch (error) {
      console.log("Erro ao salvar cliente:", error);
      return res.status(500).json({ error: "Erro ao salvar cliente" });
    }
  }

  if (req.method === "GET") {
    try {
      const result = await db.query("SELECT * FROM clientes ORDER BY id DESC");
      return res.status(200).json(result.rows);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar clientes" });
    }
  }

  return res.status(405).json({ error: "Método não permitido" });
}
