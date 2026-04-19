using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MovieBooking.Application.DTOs.Common;
using MovieBooking.Application.DTOs.User;
using MovieBooking.Application.Interfaces;

namespace MovieBooking.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NguoiDungController : ControllerBase
    {
        private readonly INguoiDungService _nguoiDungService;

        public NguoiDungController(INguoiDungService nguoiDungService)
        {
            _nguoiDungService = nguoiDungService;
        }

        /// <summary>GET /api/nguoidung — Lấy danh sách tất cả người dùng (Admin)</summary>
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll()
        {
            var data = await _nguoiDungService.GetAllAsync();
            return Ok(ApiResponse<IEnumerable<NguoiDungDto>>.SuccessResponse(data));
        }

        /// <summary>GET /api/nguoidung/{id} — Lấy thông tin người dùng theo ID</summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var data = await _nguoiDungService.GetByIdAsync(id);
            if (data == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Người dùng không tồn tại"));

            return Ok(ApiResponse<NguoiDungDto>.SuccessResponse(data));
        }

        /// <summary>PUT /api/nguoidung/{id} — Cập nhật thông tin người dùng</summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateNguoiDungDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.ErrorResponse("Dữ liệu không hợp lệ"));

            var data = await _nguoiDungService.UpdateAsync(id, dto);
            if (data == null)
                return BadRequest(ApiResponse<object>.ErrorResponse("Người dùng không tồn tại hoặc email đã được sử dụng"));

            return Ok(ApiResponse<NguoiDungDto>.SuccessResponse(data, "Cập nhật thông tin thành công"));
        }

        /// <summary>DELETE /api/nguoidung/{id} — Xóa người dùng (Admin)</summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _nguoiDungService.DeleteAsync(id);
            if (!result)
                return NotFound(ApiResponse<object>.ErrorResponse("Người dùng không tồn tại"));

            return Ok(ApiResponse<object>.SuccessResponse(null!, "Xóa người dùng thành công"));
        }

        /// <summary>PUT /api/nguoidung/{id}/doi-mat-khau — Đổi mật khẩu</summary>
        [HttpPut("{id}/doi-mat-khau")]
        public async Task<IActionResult> ChangePassword(int id, [FromBody] ChangePasswordDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.ErrorResponse("Dữ liệu không hợp lệ"));

            var (success, message) = await _nguoiDungService.ChangePasswordAsync(id, dto);
            if (!success)
                return BadRequest(ApiResponse<object>.ErrorResponse(message));

            return Ok(ApiResponse<object>.SuccessResponse(null!, message));
        }

        /// <summary>PUT /api/nguoidung/{id}/vai-tro — Cập nhật vai trò (Admin)</summary>
        [HttpPut("{id}/vai-tro")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateVaiTro(int id, [FromBody] string vaiTro)
        {
            if (vaiTro != "Admin" && vaiTro != "KhachHang")
                return BadRequest(ApiResponse<object>.ErrorResponse("Vai trò không hợp lệ. Chỉ chấp nhận: Admin, KhachHang"));

            var result = await _nguoiDungService.UpdateVaiTroAsync(id, vaiTro);
            if (!result)
                return NotFound(ApiResponse<object>.ErrorResponse("Người dùng không tồn tại"));

            return Ok(ApiResponse<object>.SuccessResponse(null!, "Cập nhật vai trò thành công"));
        }
    }
}
