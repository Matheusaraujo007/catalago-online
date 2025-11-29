import { Client } from 'pg';

export default async function handler(req, res) {
  const client = new Client({
    connectionString: process.env.NEON_DB_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  try {
    if (req.method === 'GET') {
      const result = await client.query('SELECT * FROM banners ORDER BY criado_em DESC');
      return res.status(200).json(result.rows);
    }

    if (req.method === 'POST') {
      const { titulo, descricao, imagem_base64, link } = req.body;
      if (!imagem_base64) return res.status(400).json({ message: 'Imagem é obrigatória.' });

      await client.query(
        'INSERT INTO banners (titulo, descricao, imagem_base64, link) VALUES ($1, $2, $3, $4)',
        [titulo || null, descricao || null, imagem_base64, link || null]
      );
      return res.status(201).json({ message: 'Banner salvo com sucesso!' });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ message: 'ID é obrigatório.' });

      await client.query('DELETE FROM banners WHERE id = $1', [id]);
      return res.status(200).json({ message: 'Banner excluído com sucesso!' });
    }

    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    res.status(405).end(`Método ${req.method} não permitido`);
  } catch (err) {
    console.error('Erro na API /api/banner1:', err);
    res.status(500).json({ message: 'Erro interno do servidor', erro: err.message });
  } finally {
    await client.end();
  }
}
