using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class Categoria
{
    public int Id { get; set; }

    [Required]
    [MaxLength(400)]
    public string Descricao { get; set; } = string.Empty;

    public FinalidadeCategoria? Finalidade { get; set; }

    public ICollection<Transacao> Transacoes { get; set; } = [];
}
