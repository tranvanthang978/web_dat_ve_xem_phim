using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MovieBooking.Application.DTOs.Movie;
using MovieBooking.Application.Interfaces;

namespace MovieBooking.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PhimController : ControllerBase
    {
        private readonly IPhimService _phimService;

        public PhimController(IPhimService phimService)
        {
            _phimService = phimService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllPhims()
        {
            var phims = await _phimService.GetAllPhimsAsync();
            return Ok(phims);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPhimById(int id)
        {
            var phim = await _phimService.GetPhimByIdAsync(id);
            if (phim == null)
                return NotFound(new { message = "Phim không tồn tại" });

            return Ok(phim);
        }

        [HttpGet("dang-chieu")]
        public async Task<IActionResult> GetPhimsDangChieu()
        {
            var phims = await _phimService.GetPhimsDangChieuAsync();
            return Ok(phims);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreatePhim([FromBody] CreatePhimDto createPhimDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var phim = await _phimService.CreatePhimAsync(createPhimDto);
                return CreatedAtAction(nameof(GetPhimById), new { id = phim.Id }, phim);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdatePhim(int id, [FromBody] CreatePhimDto updatePhimDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await _phimService.UpdatePhimAsync(id, updatePhimDto);
                if (!result)
                    return NotFound(new { message = "Phim không tồn tại" });

                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeletePhim(int id)
        {
            var (success, message) = await _phimService.DeletePhimAsync(id);
            if (!success)
                return BadRequest(new { message });

            return NoContent();
        }
    }
}
