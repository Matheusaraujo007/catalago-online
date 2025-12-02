import { pool } from "../db.js";

export default async function handler(req, res) {
  // Permitir apenas GET e POST
  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  // ===========================
  //      🔹 SALVAR VENDA
  // ===========================
  if (req.method === "POST") {
    try {
      const {
        cliente_id,
        valor_total,
        metodo_pagamento,
        status,
        observacoes,
        itens
      } = req.body;

      if (!valor_total || !itens || itens.length === 0) {
        return res.status(400).json({ error: "Dados incompletos da venda" });
      }

      // 1️⃣ Inserir venda
      const vendaRes = await pool.query(
        `INSERT INTO vendas (cliente_id, valor_total, metodo_pagamento, status, observacoes)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [
          cliente_id || null,
          valor_total,
          metodo_pagamento || "WhatsApp",
          status || "pendente",
          observacoes || null
        ]
      );

      const vendaId = vendaRes.rows[0].id;

      // 2️⃣ Inserir itens da venda
      for (const item of itens) {
        await pool.query(
          `INSERT INTO venda_itens (venda_id, produto_id, quantidade, preco_unitario)
           VALUES ($1, $2, $3, $4)`,
          [
            vendaId,
            item.produto_id || null, // taxa de arte vem como null
            item.quantidade,
            item.preco_unitario
          ]
        );
      }

      return res.status(201).json({
        message: "Venda registrada com sucesso",
        vendaId
      });

    } catch (error) {
      console.error("Erro ao salvar venda:", error);
      return res.status(500).json({ error: "Erro interno ao salvar venda" });
    }
  }

  // ===========================
  //      🔹 LISTAR VENDAS
  // ===========================
  if (req.method === "GET") {
    try {
      const vendas = await pool.query(
        "SELECT * FROM vendas ORDER BY id DESC"
      );
      return res.status(200).json(vendas.rows);
    } catch (error) {
      console.error("Erro ao carregar vendas:", error);
      return res.status(500).json({ error: "Erro ao carregar vendas" });
    }
  }
}
