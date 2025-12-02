import { pool } from "../db.js";

export default async function handler(req, res) {
  const { method } = req;

  if (method === "POST") {
    try {
      const {
        cliente_id,
        valor_total,
        metodo_pagamento,
        status,
        observacoes,
        itens
      } = req.body;

      // 1️⃣ SALVAR VENDA
      const vendaRes = await pool.query(
        `INSERT INTO vendas (cliente_id, valor_total, metodo_pagamento, status, observacoes)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [
          cliente_id || null,
          valor_total,
          metodo_pagamento,
          status || "pendente",
          observacoes || ""
        ]
      );

      const vendaId = vendaRes.rows[0].id;

      // 2️⃣ SALVAR ITENS DA VENDA (FORMATO DO SEU BANCO REAL)
      for (let item of itens) {
        if (!item.produto_id) continue; // taxa não entra aqui

        const valorUnitario = Number(item.preco_unitario);
        const valorTotalItem = valorUnitario * item.quantidade;

        await pool.query(
          `INSERT INTO itens_venda (venda_id, produto_id, quantidade, valor_unitario, valor_total)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            vendaId,
            item.produto_id,
            item.quantidade,
            valorUnitario,
            valorTotalItem
          ]
        );
      }

      return res.status(201).json({
        message: "Venda salva com sucesso",
        venda_id: vendaId
      });

    } catch (err) {
      console.error("❌ ERRO AO SALVAR VENDA:", err);
      return res.status(500).json({ error: "Erro ao salvar venda" });
    }
  }

  if (method === "GET") {
    try {
      const vendas = await pool.query("SELECT * FROM vendas ORDER BY id DESC");
      res.status(200).json(vendas.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro ao carregar vendas" });
    }
  }
}
