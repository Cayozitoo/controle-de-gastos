using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Backend.DTOs;

namespace Backend.Controllers;

/// <summary>
/// Gerenciamento de transações financeiras (receitas e despesas).
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class TransacaoController : ControllerBase
{
    private readonly AppDbContext _context;

    public TransacaoController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Retorna todas as transações com dados de pessoa e categoria.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult> Listar()
    {
        var transacoes = await _context.Transacoes
            .AsNoTracking()
            .Include(t => t.Pessoa)
            .Include(t => t.Categoria)
            .Select(t => new
            {
                t.Id,
                t.Descricao,
                t.Valor,
                Tipo = t.Tipo.ToString(),
                t.PessoaId,
                PessoaNome = t.Pessoa!.Nome,
                t.CategoriaId,
                CategoriaDescricao = t.Categoria!.Descricao
            })
            .ToListAsync();

        return Ok(transacoes);
    }

    /// <summary>
    /// Retorna uma transação pelo ID.
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> BuscarPorId(int id)
    {
        var transacao = await _context.Transacoes
            .AsNoTracking()
            .Include(t => t.Pessoa)
            .Include(t => t.Categoria)
            .Where(t => t.Id == id)
            .Select(t => new
            {
                t.Id,
                t.Descricao,
                t.Valor,
                Tipo = t.Tipo.ToString(),
                t.PessoaId,
                PessoaNome = t.Pessoa!.Nome,
                t.CategoriaId,
                CategoriaDescricao = t.Categoria!.Descricao
            })
            .FirstOrDefaultAsync();

        return transacao is null ? NotFound() : Ok(transacao);
    }

    /// <summary>
    /// Cadastra uma nova transação. Valida se a pessoa e a categoria existem.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> Criar(TransacaoCreateDto dto)
    {
        var pessoaExiste = await _context.Pessoas.AnyAsync(p => p.Id == dto.PessoaId);
        if (!pessoaExiste)
            return BadRequest($"Pessoa com ID {dto.PessoaId} não encontrada.");

        var categoriaExiste = await _context.Categorias.AnyAsync(c => c.Id == dto.CategoriaId);
        if (!categoriaExiste)
            return BadRequest($"Categoria com ID {dto.CategoriaId} não encontrada.");

        var transacao = new Transacao
        {
            Descricao = dto.Descricao,
            Valor = dto.Valor,
            Tipo = dto.Tipo,
            PessoaId = dto.PessoaId,
            CategoriaId = dto.CategoriaId
        };

        _context.Transacoes.Add(transacao);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(BuscarPorId), new { id = transacao.Id }, transacao);
    }

    /// <summary>
    /// Atualiza uma transação existente. Valida se a pessoa e a categoria existem.
    /// </summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Atualizar(int id, TransacaoCreateDto dto)
    {
        var transacao = await _context.Transacoes.FindAsync(id);

        if (transacao is null)
            return NotFound();

        var pessoaExiste = await _context.Pessoas.AnyAsync(p => p.Id == dto.PessoaId);
        if (!pessoaExiste)
            return BadRequest($"Pessoa com ID {dto.PessoaId} não encontrada.");

        var categoriaExiste = await _context.Categorias.AnyAsync(c => c.Id == dto.CategoriaId);
        if (!categoriaExiste)
            return BadRequest($"Categoria com ID {dto.CategoriaId} não encontrada.");

        transacao.Descricao = dto.Descricao;
        transacao.Valor = dto.Valor;
        transacao.Tipo = dto.Tipo;
        transacao.PessoaId = dto.PessoaId;
        transacao.CategoriaId = dto.CategoriaId;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Remove uma transação.
    /// </summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Remover(int id)
    {
        var transacao = await _context.Transacoes.FindAsync(id);

        if (transacao is null)
            return NotFound();

        _context.Transacoes.Remove(transacao);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
