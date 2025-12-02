import { pool } from "../db.js";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { cliente_id, valor_total, metodo_pagamento, status, observacoes, itens } = req.body;

    try {
      // 1️⃣ Inserir venda
      const venda = await pool.query(
        `INSERT INTO vendas (cliente_id, valor_total, metodo_pagamento, status, observacoes)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [cliente_id, valor_total, metodo_pagamento, status, observacoes]
      );

      const vendaId = venda.rows[0].id;

      // 2️⃣ Inserir itens na tabela CERTA -> itens_venda
      for (let item of itens) {
        await pool.query(
          `INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco_unitario, subtotal)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            vendaId,
            item.produto_id,
            item.quantidade,
            item.preco_unitario,
            item.preco_unitario * item.quantidade
          ]
        );
      }

      res.status(201).json({ message: "Venda registrada", vendaId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro ao salvar venda" });
    }
  }

  if (req.method === "GET") {
    try {
      const vendas = await pool.query(`
        SELECT v.*, 
          COALESCE(
            json_agg(
              json_build_object(
                'produto_id', i.produto_id,
                'quantidade', i.quantidade,
                'preco_unitario', i.preco_unitario,
                'subtotal', i.subtotal
              )
            ) FILTER (WHERE i.id IS NOT NULL), '[]'
          ) AS itens
        FROM vendas v
        LEFT JOIN itens_venda i ON v.id = i.venda_id
        GROUP BY v.id
        ORDER BY v.id DESC
      `);

      res.status(200).json(vendas.rows);
    } catch (err) {
      res.status(500).json({ error: "Erro ao carregar vendas" });
    }
  }
}
