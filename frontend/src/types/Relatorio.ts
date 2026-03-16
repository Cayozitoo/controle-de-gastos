// Shape retornado pelo GET /api/relatorio/totais-por-pessoa
export interface TotalPorPessoa {
  id: number;
  nome: string;
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
}

// Shape retornado pelo GET /api/relatorio/totais-por-categoria
export interface TotalPorCategoria {
  id: number;
  nome: string;
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
}
