import { pool } from "../db.js";

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case "GET": {
      const { rows } = await pool.query("SELECT * FROM clientes ORDER BY id DESC");
      res.status(200).json(rows);
      break;
    }
    case "POST": {
      const { nome, email, telefone, endereco } = req.body;
      await pool.query(
        "INSERT INTO clientes (nome, email, telefone, endereco) VALUES ($1, $2, $3, $4)",
        [nome, email, telefone, endereco]
      );
      res.status(201).json({ message: "Cliente adicionado com sucesso" });
      break;
    }
    case "DELETE": {
      const { id } = req.query;
      await pool.query("DELETE FROM clientes WHERE id = $1", [id]);
      res.status(200).json({ message: "Cliente excluído" });
      break;
    }
    default:
      res.status(405).end();
  }
}
