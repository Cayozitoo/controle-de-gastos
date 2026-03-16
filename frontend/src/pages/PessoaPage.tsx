import { useEffect, useState } from "react";
import api from "../services/api";
import type { Pessoa, PessoaCreateDto } from "../types/Pessoa";

const FORM_VAZIO: PessoaCreateDto = { nome: "", idade: 0 };

export default function PessoaPage() {
  const [pessoas,    setPessoas]    = useState<Pessoa[]>([]);
  const [form,       setForm]       = useState<PessoaCreateDto>(FORM_VAZIO);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro,       setErro]       = useState<string | null>(null);

  /* ── Carregar ─────────────────────────────────────────────────────────── */
  async function carregar() {
    setCarregando(true);
    setErro(null);
    try {
      const { data } = await api.get<Pessoa[]>("/pessoa");
      setPessoas(data);
    } catch {
      setErro("Não foi possível carregar as pessoas.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { carregar(); }, []);

  /* ── Salvar (criar ou atualizar) ──────────────────────────────────────── */
  async function salvar() {
    if (!form.nome.trim())             { setErro("O nome é obrigatório."); return; }
    if (form.nome.length > 200)        { setErro("Nome deve ter no máximo 200 caracteres."); return; }
    if (form.idade < 0 || form.idade > 150) { setErro("Idade inválida."); return; }

    setErro(null);
    try {
      if (editandoId !== null) {
        await api.put(`/pessoa/${editandoId}`, form);
      } else {
        await api.post("/pessoa", form);
      }
      setForm(FORM_VAZIO);
      setEditandoId(null);
      carregar();
    } catch {
      setErro("Erro ao salvar. Tente novamente.");
    }
  }

  function iniciarEdicao(p: Pessoa) {
    setEditandoId(p.id);
    setForm({ nome: p.nome, idade: p.idade });
    setErro(null);
  }

  function cancelar() {
    setEditandoId(null);
    setForm(FORM_VAZIO);
    setErro(null);
  }

  /* ── Deletar ──────────────────────────────────────────────────────────── */
  async function deletar(id: number) {
    if (!confirm("Remover esta pessoa? Todas as transações vinculadas serão apagadas.")) return;
    try {
      await api.delete(`/pessoa/${id}`);
      carregar();
    } catch {
      setErro("Erro ao remover pessoa.");
    }
  }

  /* ── Render ───────────────────────────────────────────────────────────── */
  return (
    <div>
      <div className="page-header">
        <h2>Pessoas</h2>
        <p>Gerencie as pessoas do sistema. Ao remover uma pessoa, suas transações são apagadas.</p>
      </div>

      {/* Formulário */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">
            {editandoId !== null ? "✏️  Editar pessoa" : "➕  Nova pessoa"}
          </span>
        </div>

        <div className="form-grid">
          <div className="form-field">
            <label>Nome</label>
            <input
              placeholder="Ex: Maria Silva"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              style={{ width: 260 }}
            />
          </div>
          <div className="form-field">
            <label>Idade</label>
            <input
              type="number"
              placeholder="Ex: 30"
              min={0} max={150}
              value={form.idade || ""}
              onChange={(e) => setForm({ ...form, idade: Number(e.target.value) })}
              style={{ width: 100 }}
            />
          </div>
          <button className="btn-primary" onClick={salvar}>
            {editandoId !== null ? "Salvar" : "Criar"}
          </button>
          {editandoId !== null && (
            <button className="btn-secondary" onClick={cancelar}>Cancelar</button>
          )}
        </div>

        {erro && <div className="msg-erro">⚠️ {erro}</div>}
      </div>

      { /* Tabela */ }
      <div className="card">
        <div className="card-header">
          <span className="card-title">Cadastradas</span>
          <span style={{ fontSize: 12, color: "var(--text-3)" }}>
            {pessoas.length} {pessoas.length === 1 ? "registro" : "registros"}
          </span>
        </div>

        {carregando ? (
          <div className="msg-loading">Carregando...</div>
        ) : pessoas.length === 0 ? (
          <div className="msg-vazio">
            <div className="msg-vazio-icon">👤</div>
            Nenhuma pessoa cadastrada ainda.
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nome</th>
                  <th>Idade</th>
                  <th style={{ textAlign: "right" }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {pessoas.map((p) => (
                  <tr key={p.id}>
                    <td className="td-mono td-dim">{p.id}</td>
                    <td style={{ fontWeight: 500 }}>{p.nome}</td>
                    <td className="td-dim">
                      {p.idade} anos
                      {p.idade < 18 && (
                        <span className="badge badge-despesa" style={{ marginLeft: 8 }}>
                          Menor
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="td-actions">
                        <button className="btn-ghost btn-sm" onClick={() => iniciarEdicao(p)}>
                          Editar
                        </button>
                        <button className="btn-danger btn-sm" onClick={() => deletar(p.id)}>
                          Remover
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
