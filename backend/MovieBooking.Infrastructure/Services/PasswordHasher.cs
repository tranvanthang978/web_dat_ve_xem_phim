using System.Security.Cryptography;
using System.Text;

namespace MovieBooking.Infrastructure.Services
{
    /// <summary>Dịch vụ mã hóa mật khẩu</summary>
    public interface IPasswordHasher
    {
        /// <summary>Mã hóa mật khẩu</summary>
        string HashPassword(string password);

        /// <summary>Kiểm tra mật khẩu khớp hay không</summary>
        bool VerifyPassword(string password, string hash);
    }

    /// <summary>Triển khai mã hóa mật khẩu SHA256</summary>
    public class Sha256PasswordHasher : IPasswordHasher
    {
        public string HashPassword(string password)
        {
            if (string.IsNullOrWhiteSpace(password))
                throw new ArgumentException("Mật khẩu không được để trống", nameof(password));

            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }

        public bool VerifyPassword(string password, string hash)
        {
            if (string.IsNullOrWhiteSpace(password) || string.IsNullOrWhiteSpace(hash))
                return false;

            var hashOfInput = HashPassword(password);
            return hashOfInput.Equals(hash);
        }
    }
}
