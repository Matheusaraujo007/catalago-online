import { pool } from "../db.js";

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case "GET":
      const { rows } = await pool.query("SELECT * FROM configuracoes LIMIT 1");
      res.status(200).json(rows[0]);
      break;

    case "POST":
      const { nome_loja, email_contato, telefone_contato, endereco_loja, logo_url, cor_tema } = req.body;
      await pool.query(
        `INSERT INTO configuracoes (nome_loja, email_contato, telefone_contato, endereco_loja, logo_url, cor_tema)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [nome_loja, email_contato, telefone_contato, endereco_loja, logo_url, cor_tema]
      );
      res.status(201).json({ message: "Configurações salvas" });
      break;

    default:
      res.status(405).end();
  }
}
