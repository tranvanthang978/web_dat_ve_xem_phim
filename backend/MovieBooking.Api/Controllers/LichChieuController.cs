using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MovieBooking.Application.DTOs.Showtime;
using MovieBooking.Application.Interfaces;

namespace MovieBooking.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LichChieuController : ControllerBase
    {
        private readonly ILichChieuService _lichChieuService;

        public LichChieuController(ILichChieuService lichChieuService)
        {
            _lichChieuService = lichChieuService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetLichChieuById(int id)
        {
            var lichChieu = await _lichChieuService.GetLichChieuByIdAsync(id);
            if (lichChieu == null)
                return NotFound(new { message = "Lịch chiếu không tồn tại" });

            return Ok(lichChieu);
        }

        [HttpGet("phim/{phimId}")]
        public async Task<IActionResult> GetLichChieuByPhimId(int phimId)
        {
            var lichChieus = await _lichChieuService.GetLichChieuByPhimIdAsync(phimId);
            return Ok(lichChieus);
        }

        [HttpGet("phong-chieu/{phongChieuId}")]
        public async Task<IActionResult> GetLichChieuByPhongChieuId(int phongChieuId)
        {
            var lichChieus = await _lichChieuService.GetLichChieuByPhongChieuIdAsync(phongChieuId);
            return Ok(lichChieus);
        }

        [HttpGet("rap/{rapId}")]
        public async Task<IActionResult> GetLichChieuByRapId(int rapId)
        {
            var lichChieus = await _lichChieuService.GetLichChieuByRapIdAsync(rapId);
            return Ok(lichChieus);
        }

        [HttpGet("{id}/ghes")]
        public async Task<IActionResult> GetGhesByLichChieuId(int id)
        {
            var ghes = await _lichChieuService.GetGhesByLichChieuIdAsync(id);
            return Ok(ghes);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateLichChieu([FromBody] CreateLichChieuDto createLichChieuDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var lichChieu = await _lichChieuService.CreateLichChieuAsync(createLichChieuDto);
                return CreatedAtAction(nameof(GetLichChieuById), new { id = lichChieu.Id }, lichChieu);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateLichChieu(int id, [FromBody] CreateLichChieuDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await _lichChieuService.UpdateLichChieuAsync(id, dto);
                if (result == null)
                    return NotFound(new { message = "Lịch chiếu không tồn tại" });
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteLichChieu(int id)
        {
            var (success, message) = await _lichChieuService.DeleteLichChieuAsync(id);
            if (!success)
                return BadRequest(new { message });

            return NoContent();
        }
    }
}
