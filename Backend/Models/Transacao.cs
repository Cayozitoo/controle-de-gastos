using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class Transacao
{
    public int Id { get; set; }

    [Required]
    [MaxLength(400)]
    public string Descricao { get; set; } = string.Empty;

    [Range(0.01, double.MaxValue, ErrorMessage = "O valor deve ser positivo.")]
    public decimal Valor { get; set; }

    public TipoTransacao Tipo { get; set; }

    public int PessoaId { get; set; }
    public Pessoa? Pessoa { get; set; }

    public int CategoriaId { get; set; }
    public Categoria? Categoria { get; set; }
}
