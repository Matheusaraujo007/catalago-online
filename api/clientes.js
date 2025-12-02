import { supabase } from "../_shared/supabaseClient";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { nome, telefone } = req.body;

    if (!nome || !telefone) {
      return res.status(400).json({ erro: "Nome e telefone obrigatórios" });
    }

    const { data, error } = await supabase
      .from("clientes")
      .insert([{ nome, telefone }]);

    if (error) return res.status(400).json({ error });

    return res.status(200).json(data);
  }

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .order("id", { ascending: false });

    if (error) return res.status(400).json({ error });

    return res.status(200).json(data);
  }

  return res.status(405).json({ erro: "Método não permitido" });
}
