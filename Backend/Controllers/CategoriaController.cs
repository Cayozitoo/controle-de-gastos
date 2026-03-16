using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Backend.DTOs;

namespace Backend.Controllers;

/// <summary>
/// Gerenciamento de categorias de transações.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class CategoriaController : ControllerBase
{
    private readonly AppDbContext _context;

    public CategoriaController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Retorna todas as categorias cadastradas.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<Categoria>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<Categoria>>> Listar()
    {
        return await _context.Categorias.ToListAsync();
    }

    /// <summary>
    /// Retorna uma categoria pelo ID.
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(Categoria), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Categoria>> BuscarPorId(int id)
    {
        var categoria = await _context.Categorias.FindAsync(id);

        return categoria is null ? NotFound() : Ok(categoria);
    }

    /// <summary>
    /// Cadastra uma nova categoria.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(Categoria), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Categoria>> Criar(CategoriaCreateDto dto)
    {
        var categoria = new Categoria
        {
            Descricao = dto.Descricao,
            Finalidade = dto.Finalidade
        };

        _context.Categorias.Add(categoria);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(BuscarPorId), new { id = categoria.Id }, categoria);
    }

    /// <summary>
    /// Atualiza uma categoria existente.
    /// </summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Atualizar(int id, CategoriaCreateDto dto)
    {
        var categoria = await _context.Categorias.FindAsync(id);

        if (categoria is null)
            return NotFound();

        categoria.Descricao = dto.Descricao;
        categoria.Finalidade = dto.Finalidade;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Remove uma categoria. Não é permitido remover categorias com transações vinculadas.
    /// </summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Remover(int id)
    {
        var categoria = await _context.Categorias
            .Include(c => c.Transacoes)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (categoria is null)
            return NotFound();

        if (categoria.Transacoes.Count > 0)
            return Conflict("Não é possível remover uma categoria com transações vinculadas.");

        _context.Categorias.Remove(categoria);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
