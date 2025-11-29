import { pool } from "../db.js";

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case "GET":
      const { rows } = await pool.query(`
        SELECT p.*, v.id AS venda_id 
        FROM pagamentos p 
        LEFT JOIN vendas v ON v.id = p.venda_id
      `);
      res.status(200).json(rows);
      break;

    case "POST":
      const { venda_id, metodo_pagamento, valor_pago, status } = req.body;
      await pool.query(
        "INSERT INTO pagamentos (venda_id, metodo_pagamento, valor_pago, status) VALUES ($1, $2, $3, $4)",
        [venda_id, metodo_pagamento, valor_pago, status]
      );
      res.status(201).json({ message: "Pagamento salvo" });
      break;

    default:
      res.status(405).end();
  }
}
