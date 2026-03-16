using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class Pessoa
{
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Nome { get; set; } = string.Empty;

    [Range(0, 150)]
    public int Idade { get; set; }

    public ICollection<Transacao> Transacoes { get; set; } = [];
}
