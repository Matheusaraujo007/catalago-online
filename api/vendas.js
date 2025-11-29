// api/vendas.js
import { Client } from "pg";

export default async function handler(req, res) {
  const client = new Client({
    connectionString: process.env.NEON_DB_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  try {
    // === [GET] Buscar todas as vendas ===
if (req.method === "GET") {
  const result = await client.query(`
    SELECT 
      v.id,
      v.cliente_id,
      c.nome AS cliente_nome,
      c.telefone AS cliente_telefone,
      c.email AS cliente_email,
      v.data_venda,
      v.valor_total,
      v.status,
      v.metodo_pagamento,
      v.observacoes,
      COALESCE(
        json_agg(
          json_build_object(
            'produto_id', i.produto_id,
            'quantidade', i.quantidade,
            'preco_unitario', i.preco_unitario,
            'subtotal', i.subtotal,
            'produto_nome', p.nome,
            'imagem', p.imagem_base64
          )
        ) FILTER (WHERE i.produto_id IS NOT NULL),
        '[]'
      ) AS itens
    FROM vendas v
    LEFT JOIN clientes c ON v.cliente_id = c.id
    LEFT JOIN itens_venda i ON v.id = i.venda_id
    LEFT JOIN produtos p ON i.produto_id = p.id
    GROUP BY v.id, c.nome, c.telefone, c.email
    ORDER BY v.data_venda DESC
  `);

  return res.status(200).json(result.rows);
}
    // === [POST] Registrar nova venda ===
    else if (req.method === "POST") {
      const { cliente_id, valor_total, metodo_pagamento, status, observacoes, itens } = req.body;

      const vendaQuery = `
        INSERT INTO vendas (cliente_id, valor_total, metodo_pagamento, status, observacoes)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `;
      const vendaValues = [cliente_id || null, valor_total, metodo_pagamento, status || "pendente", observacoes || ""];
      const vendaResult = await client.query(vendaQuery, vendaValues);
      const vendaId = vendaResult.rows[0].id;

      // Salvar itens da venda
      for (const item of itens) {
        await client.query(
          `INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco_unitario)
           VALUES ($1, $2, $3, $4)`,
          [vendaId, item.produto_id, item.quantidade, item.preco_unitario]
        );
      }

      return res.status(201).json({ message: "Venda registrada com sucesso!", venda_id: vendaId });
    }

    else {
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).end(`Método ${req.method} não permitido`);
    }
  } catch (error) {
    console.error("Erro em /api/vendas:", error);
    return res.status(500).json({ message: "Erro interno no servidor", error: error.message });
  } finally {
    await client.end();
  }
}