using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;

namespace Backend.Controllers;

/// <summary>
/// Relatórios consolidados de receitas, despesas e saldos.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class RelatorioController : ControllerBase
{
    private readonly AppDbContext _context;

    public RelatorioController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Retorna o total de receitas, despesas e saldo calculado por pessoa.
    /// </summary>
    [HttpGet("totais-por-pessoa")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult> TotaisPorPessoa()
    {
        var pessoas = await _context.Pessoas
            .AsNoTracking()
            .Include(p => p.Transacoes)
            .ToListAsync();

        var resultado = pessoas.Select(p => CalcularTotais(
            id: p.Id,
            nome: p.Nome,
            transacoes: p.Transacoes
        ));

        return Ok(resultado);
    }

    /// <summary>
    /// Retorna o total de receitas, despesas e saldo calculado por categoria.
    /// </summary>
    [HttpGet("totais-por-categoria")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult> TotaisPorCategoria()
    {
        var categorias = await _context.Categorias
            .AsNoTracking()
            .Include(c => c.Transacoes)
            .ToListAsync();

        var resultado = categorias.Select(c => CalcularTotais(
            id: c.Id,
            nome: c.Descricao,
            transacoes: c.Transacoes
        ));

        return Ok(resultado);
    }

    // Calcula receitas, despesas e saldo a partir de uma coleção de transações
    private static object CalcularTotais(int id, string nome, ICollection<Transacao> transacoes)
    {
        var totalReceitas = transacoes
            .Where(t => t.Tipo == TipoTransacao.Receita)
            .Sum(t => t.Valor);

        var totalDespesas = transacoes
            .Where(t => t.Tipo == TipoTransacao.Despesa)
            .Sum(t => t.Valor);

        return new
        {
            Id = id,
            Nome = nome,
            TotalReceitas = totalReceitas,
            TotalDespesas = totalDespesas,
            Saldo = totalReceitas - totalDespesas
        };
    }
}
