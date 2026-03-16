using System.ComponentModel.DataAnnotations;
using Backend.Models;

namespace Backend.DTOs;

public class TransacaoCreateDto
{
    [Required(ErrorMessage = "A descrição é obrigatória.")]
    [MaxLength(400, ErrorMessage = "A descrição deve ter no máximo 400 caracteres.")]
    public string Descricao { get; set; } = string.Empty;

    [Range(0.01, double.MaxValue, ErrorMessage = "O valor deve ser maior que zero.")]
    public decimal Valor { get; set; }

    [Required(ErrorMessage = "O tipo da transação é obrigatório.")]
    public TipoTransacao Tipo { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "PessoaId inválido.")]
    public int PessoaId { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "CategoriaId inválido.")]
    public int CategoriaId { get; set; }
}
