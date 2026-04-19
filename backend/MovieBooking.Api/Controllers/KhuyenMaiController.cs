using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MovieBooking.Application.DTOs.Promotion;
using MovieBooking.Application.Interfaces;

namespace MovieBooking.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class KhuyenMaiController : ControllerBase
    {
        private readonly IKhuyenMaiService _khuyenMaiService;

        public KhuyenMaiController(IKhuyenMaiService khuyenMaiService)
        {
            _khuyenMaiService = khuyenMaiService;
        }

        [HttpGet("validate/{ma}")]
        public async Task<IActionResult> ValidateMa(string ma)
        {
            var all = await _khuyenMaiService.GetAllKhuyenMaiAsync();
            var now = DateTime.UtcNow;
            var km = all.FirstOrDefault(k =>
                k.MaKhuyenMai.ToUpper() == ma.ToUpper() &&
                k.ConHieuLuc &&
                k.NgayBatDau <= now &&
                k.NgayKetThuc >= now &&
                (k.SoLuotSuDung == 0 || k.SoLuotDaDung < k.SoLuotSuDung));

            if (km == null)
                return NotFound(new { message = "Mã khuyến mại không hợp lệ, đã hết hạn hoặc đã hết lượt sử dụng" });

            return Ok(km);
        }


        [HttpGet]
        public async Task<IActionResult> GetAllKhuyenMai()
        {
            var khuyenMais = await _khuyenMaiService.GetAllKhuyenMaiAsync();
            return Ok(khuyenMais);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetKhuyenMaiById(int id)
        {
            var khuyenMai = await _khuyenMaiService.GetKhuyenMaiByIdAsync(id);
            if (khuyenMai == null)
                return NotFound(new { message = "Khuyến mại không tồn tại" });

            return Ok(khuyenMai);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateKhuyenMai([FromBody] CreateKhuyenMaiDto createKhuyenMaiDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var khuyenMai = await _khuyenMaiService.CreateKhuyenMaiAsync(createKhuyenMaiDto);
                return CreatedAtAction(nameof(GetKhuyenMaiById), new { id = khuyenMai.Id }, khuyenMai);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateKhuyenMai(int id, [FromBody] UpdateKhuyenMaiDto updateKhuyenMaiDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var khuyenMai = await _khuyenMaiService.UpdateKhuyenMaiAsync(id, updateKhuyenMaiDto);
                if (khuyenMai == null)
                    return NotFound(new { message = "Khuyến mại không tồn tại" });
                return Ok(khuyenMai);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteKhuyenMai(int id)
        {
            var result = await _khuyenMaiService.DeleteKhuyenMaiAsync(id);
            if (!result)
                return NotFound(new { message = "Khuyến mại không tồn tại" });

            return NoContent();
        }
    }
}
