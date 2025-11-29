import { Client } from "pg";

export default function Pedido({ pedido, erro }) {
  if (erro) return (
    <div style={{ padding: "50px", fontFamily: "Arial, sans-serif", textAlign: "center", color: "red" }}>
      <h1>{erro}</h1>
    </div>
  );

  const { cliente, itens, total, endereco } = pedido;

  return (
    <div style={{
      maxWidth: "600px",
      margin: "50px auto",
      padding: "20px",
      border: "2px solid #333",
      borderRadius: "10px",
      fontFamily: "'Poppins', sans-serif",
      boxShadow: "0px 4px 10px rgba(0,0,0,0.1)"
    }}>
      <h1 style={{ textAlign: "center", marginBottom: "20px", color: "#444" }}>Resumo do Pedido</h1>
      <p><strong>Cliente:</strong> {cliente}</p>
      <p><strong>Endereço:</strong> {endereco || "Retirada na loja"}</p>
      <p><strong>Contato:</strong> (88) 99490-7177</p>
      <hr style={{ margin: "15px 0" }} />

      <h2 style={{ color: "#444" }}>Itens:</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {itens.map((item, i) => (
          <li key={i} style={{ marginBottom: "10px", padding: "5px 0", borderBottom: "1px solid #eee" }}>
            <strong>{item.quantidade || 1}x {item.nome}</strong> - R$ {(item.preco * (item.quantidade || 1)).toFixed(2)}
          </li>
        ))}
      </ul>

      <hr style={{ margin: "15px 0" }} />
      <h3>Total: R$ {total}</h3>

      <p style={{ marginTop: "20px", textAlign: "center", fontStyle: "italic", color: "#555" }}>
        Pedido feito com 💖 Manchinha Px Arts
      </p>
    </div>
  );
}

export async function getServerSideProps({ params }) {
  const client = new Client({ connectionString: process.env.NEON_DB_URL });
  await client.connect();

  try {
    const resultado = await client.query("SELECT * FROM pedidos WHERE id = $1", [params.id]);
    await client.end();

    if (resultado.rows.length === 0) {
      return { props: { erro: "Pedido não encontrado." } };
    }

    const pedido = resultado.rows[0];
    pedido.itens = JSON.parse(pedido.itens);

    return { props: { pedido } };
  } catch (err) {
    await client.end();
    return { props: { erro: err.message } };
  }
}
