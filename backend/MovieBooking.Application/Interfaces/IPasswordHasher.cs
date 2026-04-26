namespace MovieBooking.Application.Interfaces
{
    public interface IPasswordHasher
    {
        /// <summary>Mã hóa mật khẩu</summary>
        string HashPassword(string password);

        /// <summary>Kiểm tra mật khẩu khớp hay không</summary>
        bool VerifyPassword(string password, string hash);
    }
}
