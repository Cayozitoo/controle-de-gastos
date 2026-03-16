// Backend original: Tipo é int (1 = Despesa, 2 = Receita)
export const TIPO_DESPESA = 2;
export const TIPO_RECEITA = 1;

// Mapa para exibição na UI
export const TIPO_LABEL: Record<number, string> = {
  [TIPO_DESPESA]: "Despesa",
  [TIPO_RECEITA]: "Receita",
};

// Shape retornado pelo GET /api/transacao
export interface Transacao {
  id: number;
  descricao: string;
  valor: number;
  tipo: number; // 1 = Despesa, 2 = Receita
  pessoaId: number;
  pessoaNome: string;
  categoriaId: number;
  categoriaDescricao: string;
}

export interface TransacaoCreateDto {
  descricao: string;
  valor: number;
  tipo: number; // 1 = Despesa, 2 = Receita
  pessoaId: number;
  categoriaId: number;
}
