import { useEffect, useState } from "react";
import api from "../services/api";
import type { TotalPorPessoa, TotalPorCategoria } from "../types/Relatorio";

type Aba = "pessoa" | "categoria";

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function corSaldo(v: number) {
  if (v > 0) return "var(--green)";
  if (v < 0) return "var(--red)";
  return "var(--text-2)";
}

export default function RelatorioPage() {
  const [aba,          setAba]          = useState<Aba>("pessoa");
  const [porPessoa,    setPorPessoa]    = useState<TotalPorPessoa[]>([]);
  const [porCategoria, setPorCategoria] = useState<TotalPorCategoria[]>([]);
  const [carregando,   setCarregando]   = useState(false);
  const [erro,         setErro]         = useState<string | null>(null);

  /* ── Carregar ─────────────────────────────────────────────────────────── */
  async function carregar() {
    setCarregando(true);
    setErro(null);
    try {
      const [resP, resC] = await Promise.all([
        api.get<TotalPorPessoa[]>("/relatorio/totais-por-pessoa"),
        api.get<TotalPorCategoria[]>("/relatorio/totais-por-categoria"),
      ]);
      setPorPessoa(resP.data);
      setPorCategoria(resC.data);
    } catch {
      setErro("Não foi possível carregar o relatório.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { carregar(); }, []);

  /* ── Totais globais ───────────────────────────────────────────────────── */
  const dados = aba === "pessoa" ? porPessoa : porCategoria;

  const totalReceitas = dados.reduce((s, r) => s + r.totalReceitas, 0);
  const totalDespesas = dados.reduce((s, r) => s + r.totalDespesas, 0);
  const saldoGeral    = totalReceitas - totalDespesas;

  /* ── Render ───────────────────────────────────────────────────────────── */
  return (
    <div>
      <div className="page-header">
        <h2>Relatório Financeiro</h2>
        <p>Visão consolidada de receitas, despesas e saldo.</p>
      </div>

      {/* Stat cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Total Receitas</div>
          <div className="stat-value verde">{fmt(totalReceitas)}</div>
          <div className="stat-sub">Soma de todas as entradas</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Despesas</div>
          <div className="stat-value vermelho">{fmt(totalDespesas)}</div>
          <div className="stat-sub">Soma de todas as saídas</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Saldo Líquido</div>
          <div className={`stat-value ${saldoGeral >= 0 ? "dourado" : "vermelho"}`}>
            {fmt(saldoGeral)}
          </div>
          <div className="stat-sub">Receitas − Despesas</div>
        </div>
      </div>

      {/* Tabela detalhada */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Detalhamento</span>
          <button className="btn-ghost btn-sm" onClick={carregar}>↻ Atualizar</button>
        </div>

        <div className="tabs">
          <button
            className={aba === "pessoa" ? "tab-ativo" : ""}
            onClick={() => setAba("pessoa")}
          >
            👤 Por Pessoa
          </button>
          <button
            className={aba === "categoria" ? "tab-ativo" : ""}
            onClick={() => setAba("categoria")}
          >
            🏷️ Por Categoria
          </button>
        </div>

        {erro && <div className="msg-erro">⚠️ {erro}</div>}

        {carregando ? (
          <div className="msg-loading">Carregando...</div>
        ) : dados.length === 0 ? (
          <div className="msg-vazio">
            <div className="msg-vazio-icon">📊</div>
            Nenhum dado disponível para este relatório.
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{aba === "pessoa" ? "Pessoa" : "Categoria"}</th>
                  <th>Receitas</th>
                  <th>Despesas</th>
                  <th>Saldo</th>
                </tr>
              </thead>
              <tbody>
                {dados.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 500 }}>{item.nome}</td>
                    <td className="td-mono" style={{ color: "var(--green)" }}>
                      {fmt(item.totalReceitas)}
                    </td>
                    <td className="td-mono" style={{ color: "var(--red)" }}>
                      {fmt(item.totalDespesas)}
                    </td>
                    <td className="td-mono" style={{ color: corSaldo(item.saldo), fontWeight: 600 }}>
                      {fmt(item.saldo)}
                    </td>
                  </tr>
                ))}

                {/* Linha de total geral */}
                <tr className="row-total">
                  <td>Total Geral</td>
                  <td>{fmt(totalReceitas)}</td>
                  <td>{fmt(totalDespesas)}</td>
                  <td>{fmt(saldoGeral)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
