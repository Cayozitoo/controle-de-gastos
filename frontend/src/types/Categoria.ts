// Espelha o backend original: Finalidade é string? no model Categoria
export type FinalidadeCategoria = "Receita" | "Despesa" | "Ambas";

export interface Categoria {
  id: number;
  descricao: string;
  finalidade: FinalidadeCategoria | null;
}

export interface CategoriaCreateDto {
  descricao: string;
  finalidade: string | null; // backend aceita string?
}
