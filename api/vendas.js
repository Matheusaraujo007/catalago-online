import { pool } from "../db.js";

export default async function handler(req, res) {
  const { method } = req;

  if (method === "POST") {
    try {
      const { valor_total, metodo_pagamento, status, observacoes, itens } = req.body;

      // 1) Criar venda
      const vendaResult = await pool.query(
        `INSERT INTO vendas (valor_total, metodo_pagamento, status, observacoes)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [valor_total, metodo_pagamento, status, observacoes]
      );

      const vendaId = vendaResult.rows[0].id;

      // 2) Criar itens
      for (const item of itens) {
        await pool.query(
          `INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco_unitario)
           VALUES ($1, $2, $3, $4)`,
          [vendaId, item.produto_id, item.quantidade, item.preco_unitario]
        );
      }

      return res.status(201).json({ message: "Venda salva!", vendaId });

    } catch (error) {
      console.error("Erro ao salvar venda:", error);
      return res.status(500).json({ error: "Erro ao salvar venda" });
    }
  }

  if (method === "GET") {
    try {
      const vendas = await pool.query("SELECT * FROM vendas ORDER BY id DESC");
      return res.status(200).json(vendas.rows);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao carregar vendas" });
    }
  }

  return res.status(405).json({ error: "Método não permitido" });
}
