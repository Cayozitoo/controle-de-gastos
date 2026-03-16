import { useEffect, useState, useMemo } from "react";
import api from "../services/api";
import type { Pessoa } from "../types/Pessoa";
import type { Categoria } from "../types/Categoria";
import type { Transacao, TransacaoCreateDto } from "../types/Transacao";
import { TIPO_DESPESA, TIPO_RECEITA, TIPO_LABEL } from "../types/Transacao";

const FORM_VAZIO: TransacaoCreateDto = {
  descricao: "", valor: 0, tipo: TIPO_DESPESA, pessoaId: 0, categoriaId: 0,
};

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function TransacaoPage() {
  const [transacoes,  setTransacoes]  = useState<Transacao[]>([]);
  const [pessoas,     setPessoas]     = useState<Pessoa[]>([]);
  const [categorias,  setCategorias]  = useState<Categoria[]>([]);
  const [form,        setForm]        = useState<TransacaoCreateDto>(FORM_VAZIO);
  const [editandoId,  setEditandoId]  = useState<number | null>(null);
  const [carregando,  setCarregando]  = useState(false);
  const [erro,        setErro]        = useState<string | null>(null);

  /* ── Regra: menor de idade só pode registrar Despesa ──────────────────── */
  const pessoaSelecionada = useMemo(
    () => pessoas.find((p) => p.id === form.pessoaId),
    [pessoas, form.pessoaId]
  );

  const ehMenor = (pessoaSelecionada?.idade ?? 18) < 18;

  // Ao selecionar menor, força tipo Despesa
  useEffect(() => {
    if (ehMenor && form.tipo === TIPO_RECEITA) {
      setForm((f) => ({ ...f, tipo: TIPO_DESPESA, categoriaId: 0 }));
    }
  }, [ehMenor]);

  /* ── Categorias filtradas pela finalidade compatível com o tipo ────────── */
  const tipoLabel = form.tipo === TIPO_RECEITA ? "Receita" : "Despesa";

  const categoriasFiltradas = useMemo(() => {
    return categorias.filter((c) => {
      if (!c.finalidade || c.finalidade === "Ambas") return true;
      return c.finalidade === tipoLabel;
    });
  }, [categorias, form.tipo]);

  // Limpa categoria se ficou incompatível após mudar o tipo
  useEffect(() => {
    const ainda = categoriasFiltradas.find((c) => c.id === form.categoriaId);
    if (!ainda) setForm((f) => ({ ...f, categoriaId: 0 }));
  }, [categoriasFiltradas]);

  /* ── Carregar ─────────────────────────────────────────────────────────── */
  async function carregar() {
    setCarregando(true);
    setErro(null);
    try {
      const [resT, resP, resC] = await Promise.all([
        api.get<Transacao[]>("/transacao"),
        api.get<Pessoa[]>("/pessoa"),
        api.get<Categoria[]>("/categoria"),
      ]);
      setTransacoes(resT.data);
      setPessoas(resP.data);
      setCategorias(resC.data);
    } catch {
      setErro("Não foi possível carregar os dados.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { carregar(); }, []);

  /* ── Salvar ───────────────────────────────────────────────────────────── */
  async function salvar() {
    if (!form.descricao.trim())      { setErro("A descrição é obrigatória."); return; }
    if (form.descricao.length > 400) { setErro("Descrição deve ter no máximo 400 caracteres."); return; }
    if (form.valor <= 0)             { setErro("O valor deve ser maior que zero."); return; }
    if (form.pessoaId === 0)         { setErro("Selecione uma pessoa."); return; }
    if (form.categoriaId === 0)      { setErro("Selecione uma categoria."); return; }
    if (ehMenor && form.tipo === TIPO_RECEITA) {
      setErro("Menores de idade só podem registrar despesas.");
      return;
    }

    setErro(null);
    try {
      if (editandoId !== null) {
        await api.put(`/transacao/${editandoId}`, form);
      } else {
        await api.post("/transacao", form);
      }
      setForm(FORM_VAZIO);
      setEditandoId(null);
      carregar();
    } catch {
      setErro("Erro ao salvar transação.");
    }
  }

  function iniciarEdicao(t: Transacao) {
    setEditandoId(t.id);
    setForm({
      descricao:   t.descricao,
      valor:       t.valor,
      tipo:        t.tipo,
      pessoaId:    t.pessoaId,
      categoriaId: t.categoriaId,
    });
    setErro(null);
  }

  function cancelar() {
    setEditandoId(null);
    setForm(FORM_VAZIO);
    setErro(null);
  }

  async function deletar(id: number) {
    if (!confirm("Remover esta transação?")) return;
    try {
      await api.delete(`/transacao/${id}`);
      carregar();
    } catch {
      setErro("Erro ao remover transação.");
    }
  }

  /* ── Render ───────────────────────────────────────────────────────────── */
  return (
    <div>
      <div className="page-header">
        <h2>Transações</h2>
        <p>Registre receitas e despesas por pessoa e categoria.</p>
      </div>

      {/* Formulário */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">
            {editandoId !== null ? "✏️  Editar transação" : "➕  Nova transação"}
          </span>
          {ehMenor && form.pessoaId !== 0 && (
            <span className="badge badge-despesa">Menor de idade — só Despesa</span>
          )}
        </div>

        <div className="form-grid">
          <div className="form-field">
            <label>Descrição</label>
            <input
              placeholder="Ex: Supermercado"
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              style={{ width: 240 }}
            />
          </div>

          <div className="form-field">
            <label>Valor (R$)</label>
            <input
              type="number" min={0.01} step={0.01} placeholder="0,00"
              value={form.valor || ""}
              onChange={(e) => setForm({ ...form, valor: Number(e.target.value) })}
              style={{ width: 120 }}
            />
          </div>

          <div className="form-field">
            <label>Pessoa</label>
            <select
              value={form.pessoaId}
              onChange={(e) =>
                setForm({ ...form, pessoaId: Number(e.target.value), categoriaId: 0 })
              }
              style={{ width: 180 }}
            >
              <option value={0}>Selecione</option>
              {pessoas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}{p.idade < 18 ? " 🔞" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label>Tipo</label>
            <select
              value={form.tipo}
              onChange={(e) =>
                setForm({ ...form, tipo: Number(e.target.value), categoriaId: 0 })
              }
              style={{ width: 130 }}
              disabled={ehMenor}
            >
              {!ehMenor && <option value={TIPO_RECEITA}>Receita</option>}
              <option value={TIPO_DESPESA}>Despesa</option>
            </select>
          </div>

          <div className="form-field">
            <label>Categoria</label>
            <select
              value={form.categoriaId}
              onChange={(e) => setForm({ ...form, categoriaId: Number(e.target.value) })}
              style={{ width: 200 }}
            >
              <option value={0}>Selecione</option>
              {categoriasFiltradas.map((c) => (
                <option key={c.id} value={c.id}>{c.descricao}</option>
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
          <span className="card-title">Registradas</span>
          <span style={{ fontSize: 12, color: "var(--text-3)" }}>
            {transacoes.length} {transacoes.length === 1 ? "registro" : "registros"}
          </span>
        </div>

        {carregando ? (
          <div className="msg-loading">Carregando...</div>
        ) : transacoes.length === 0 ? (
          <div className="msg-vazio">
            <div className="msg-vazio-icon">💸</div>
            Nenhuma transação registrada ainda.
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Descrição</th>
                  <th>Tipo</th>
                  <th>Valor</th>
                  <th>Categoria</th>
                  <th>Pessoa</th>
                  <th style={{ textAlign: "right" }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {transacoes.map((t) => (
                  <tr key={t.id}>
                    <td className="td-mono td-dim">{t.id}</td>
                    <td style={{ fontWeight: 500 }}>{t.descricao}</td>
                    <td>
                      <span className={`badge ${t.tipo === TIPO_RECEITA ? "badge-receita" : "badge-despesa"}`}>
                        {TIPO_LABEL[t.tipo] ?? t.tipo}
                      </span>
                    </td>
                    <td className="td-mono" style={{ color: t.tipo === TIPO_RECEITA ? "var(--green)" : "var(--red)" }}>
                      {fmt(t.valor)}
                    </td>
                    <td className="td-dim">{t.categoriaDescricao}</td>
                    <td className="td-dim">{t.pessoaNome}</td>
                    <td>
                      <div className="td-actions">
                        <button className="btn-ghost btn-sm" onClick={() => iniciarEdicao(t)}>Editar</button>
                        <button className="btn-danger btn-sm" onClick={() => deletar(t.id)}>Remover</button>
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
