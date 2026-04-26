using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MovieBooking.Application.DTOs.Cinema;
using MovieBooking.Application.DTOs.Common;
using MovieBooking.Application.Interfaces;

namespace MovieBooking.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RapController : ControllerBase
    {
        private readonly IRapService _rapService;

        public RapController(IRapService rapService)
        {
            _rapService = rapService;
        }


        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var data = await _rapService.GetAllRapsAsync();
            return Ok(ApiResponse<IEnumerable<RapDto>>.SuccessResponse(data));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var data = await _rapService.GetRapByIdAsync(id);
            if (data == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Rạp không tồn tại"));

            return Ok(ApiResponse<RapDto>.SuccessResponse(data));
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] CreateRapDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.ErrorResponse("Dữ liệu không hợp lệ"));

            try
            {
                var data = await _rapService.CreateRapAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = data.Id },
                    ApiResponse<RapDto>.SuccessResponse(data, "Tạo rạp thành công"));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse(ex.Message));
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateRapDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.ErrorResponse("Dữ liệu không hợp lệ"));

            try
            {
                var data = await _rapService.UpdateRapAsync(id, dto);
                if (data == null)
                    return NotFound(ApiResponse<object>.ErrorResponse("Rạp không tồn tại"));

                return Ok(ApiResponse<RapDto>.SuccessResponse(data, "Cập nhật rạp thành công"));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse(ex.Message));
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var result = await _rapService.DeleteRapAsync(id);
                if (!result)
                    return NotFound(ApiResponse<object>.ErrorResponse("Rạp không tồn tại"));

                return Ok(ApiResponse<object?>.SuccessResponse(null, "Xóa rạp thành công"));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse(ex.Message));
            }
        }


        [HttpGet("{rapId}/phong-chieu")]
        public async Task<IActionResult> GetPhongChieus(int rapId)
        {
            var data = await _rapService.GetPhongChieusByRapIdAsync(rapId);
            return Ok(ApiResponse<IEnumerable<PhongChieuDto>>.SuccessResponse(data));
        }

        [HttpGet("phong-chieu/{id}")]
        public async Task<IActionResult> GetPhongChieuById(int id)
        {
            var data = await _rapService.GetPhongChieuByIdAsync(id);
            if (data == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Phòng chiếu không tồn tại"));

            return Ok(ApiResponse<PhongChieuDto>.SuccessResponse(data));
        }

        [HttpPost("phong-chieu")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreatePhongChieu([FromBody] CreatePhongChieuDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.ErrorResponse("Dữ liệu không hợp lệ"));

            try
            {
                var data = await _rapService.CreatePhongChieuAsync(dto);
                return CreatedAtAction(nameof(GetPhongChieuById), new { id = data.Id },
                    ApiResponse<PhongChieuDto>.SuccessResponse(data, "Tạo phòng chiếu thành công"));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse(ex.Message));
            }
        }

        [HttpPut("phong-chieu/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdatePhongChieu(int id, [FromBody] UpdatePhongChieuDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.ErrorResponse("Dữ liệu không hợp lệ"));

            try
            {
                var data = await _rapService.UpdatePhongChieuAsync(id, dto);
                if (data == null)
                    return NotFound(ApiResponse<object>.ErrorResponse("Phòng chiếu không tồn tại"));

                return Ok(ApiResponse<PhongChieuDto>.SuccessResponse(data, "Cập nhật phòng chiếu thành công"));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse(ex.Message));
            }
        }

        [HttpDelete("phong-chieu/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeletePhongChieu(int id)
        {
            var (success, message) = await _rapService.DeletePhongChieuAsync(id);
            if (!success)
                return BadRequest(ApiResponse<object>.ErrorResponse(message));

            return Ok(ApiResponse<object?>.SuccessResponse(null, message));
        }


        [HttpGet("phong-chieu/{phongChieuId}/ghe")]
        public async Task<IActionResult> GetGhes(int phongChieuId)
        {
            var data = await _rapService.GetGhesByPhongChieuAsync(phongChieuId);
            return Ok(ApiResponse<IEnumerable<GheDto>>.SuccessResponse(data));
        }
    }
}
