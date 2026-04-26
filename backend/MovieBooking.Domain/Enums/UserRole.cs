namespace MovieBooking.Domain.Enums
{
    /// <summary>Vai trò người dùng — giá trị ToString() khớp với cột VaiTro trong DB</summary>
    public enum UserRole
    {
        /// <summary>Khách hàng</summary>
        KhachHang = 0,

        /// <summary>Quản trị viên</summary>
        Admin = 1
    }
}
