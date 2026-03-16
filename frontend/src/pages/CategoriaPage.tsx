import { useEffect, useState } from "react";
import api from "../services/api";
import type { Categoria, CategoriaCreateDto, FinalidadeCategoria } from "../types/Categoria";

const FINALIDADES: FinalidadeCategoria[] = ["Receita", "Despesa", "Ambas"];

const FORM_VAZIO: CategoriaCreateDto = { descricao: "", finalidade: null };

const badgeClass: Record<string, string> = {
  Receita: "badge-receita",
  Despesa: "badge-despesa",
  Ambas:   "badge-ambas",
};

export default function CategoriaPage() {
  const [categorias,  setCategorias]  = useState<Categoria[]>([]);
  const [form,        setForm]        = useState<CategoriaCreateDto>(FORM_VAZIO);
  const [editandoId,  setEditandoId]  = useState<number | null>(null);
  const [carregando,  setCarregando]  = useState(false);
  const [erro,        setErro]        = useState<string | null>(null);

  /* ── Carregar ─────────────────────────────────────────────────────────── */
  async function carregar() {
    setCarregando(true);
    setErro(null);
    try {
      const { data } = await api.get<Categoria[]>("/categoria");
      setCategorias(data);
    } catch {
      setErro("Não foi possível carregar as categorias.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { carregar(); }, []);

  /* ── Salvar ───────────────────────────────────────────────────────────── */
  async function salvar() {
    if (!form.descricao.trim())        { setErro("A descrição é obrigatória."); return; }
    if (form.descricao.length > 400)   { setErro("Descrição deve ter no máximo 400 caracteres."); return; }

    setErro(null);
    try {
      if (editandoId !== null) {
        await api.put(`/categoria/${editandoId}`, form);
      } else {
        await api.post("/categoria", form);
      }
      setForm(FORM_VAZIO);
      setEditandoId(null);
      carregar();
    } catch {
      setErro("Erro ao salvar categoria.");
    }
  }

  function iniciarEdicao(c: Categoria) {
    setEditandoId(c.id);
    setForm({ descricao: c.descricao, finalidade: c.finalidade });
    setErro(null);
  }

  function cancelar() {
    setEditandoId(null);
    setForm(FORM_VAZIO);
    setErro(null);
  }

  async function deletar(id: number) {
    if (!confirm("Remover esta categoria?")) return;
    try {
      await api.delete(`/categoria/${id}`);
      carregar();
    } catch (err: any) {
      if (err.response?.status === 409) {
        setErro("Não é possível remover uma categoria com transações vinculadas.");
      } else {
        setErro("Erro ao remover categoria.");
      }
    }
  }

  /* ── Render ───────────────────────────────────────────────────────────── */
  return (
    <div>
      <div className="page-header">
        <h2>Categorias</h2>
        <p>Classifique suas transações por categoria e finalidade.</p>
      </div>

      {/* Formulário */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">
            {editandoId !== null ? "✏️  Editar categoria" : "➕  Nova categoria"}
          </span>
        </div>

        <div className="form-grid">
          <div className="form-field">
            <label>Descrição</label>
            <input
              placeholder="Ex: Alimentação"
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              style={{ width: 280 }}
            />
          </div>
          <div className="form-field">
            <label>Finalidade</label>
            <select
              value={form.finalidade ?? ""}
              onChange={(e) =>
                setForm({ ...form, finalidade: e.target.value || null })
              }
              style={{ width: 160 }}
            >
              <option value="">Não definida</option>
              {FINALIDADES.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
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

      {/* Tabela */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Cadastradas</span>
          <span style={{ fontSize: 12, color: "var(--text-3)" }}>
            {categorias.length} {categorias.length === 1 ? "registro" : "registros"}
          </span>
        </div>

        {carregando ? (
          <div className="msg-loading">Carregando...</div>
        ) : categorias.length === 0 ? (
          <div className="msg-vazio">
            <div className="msg-vazio-icon">🏷️</div>
            Nenhuma categoria cadastrada ainda.
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Descrição</th>
                  <th>Finalidade</th>
                  <th style={{ textAlign: "right" }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {categorias.map((c) => (
                  <tr key={c.id}>
                    <td className="td-mono td-dim">{c.id}</td>
                    <td style={{ fontWeight: 500 }}>{c.descricao}</td>
                    <td>
                      {c.finalidade ? (
                        <span className={`badge ${badgeClass[c.finalidade] ?? ""}`}>
                          {c.finalidade}
                        </span>
                      ) : (
                        <span className="td-dim">—</span>
                      )}
                    </td>
                    <td>
                      <div className="td-actions">
                        <button className="btn-ghost btn-sm" onClick={() => iniciarEdicao(c)}>Editar</button>
                        <button className="btn-danger btn-sm" onClick={() => deletar(c.id)}>Remover</button>
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
