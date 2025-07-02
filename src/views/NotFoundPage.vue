<template>
  <div class="main-container">
    <div class="content-left">
      <div class="contact-section">
        <h2>*Vui lòng liên hệ với bộ phận Estec Digital để truy cập tính năng này</h2>
        <p>
          Cảm ơn bạn đã quan tâm đến các giải pháp của ESTEC Solutions. Liên hệ với chúng
          tôi ngay qua số hotline dưới đây để đội ngũ ESTEC Solutions tư vấn chi tiết hơn
          về giải pháp và lộ trình phù hợp với đặc thù doanh nghiệp của bạn!
        </p>
        <div class="hotline">
          <img src="@/assets/icon/phone.svg" alt="Phone Icon" class="phone-icon" />
          <span>(+84) 28 8886 8799</span>
        </div>
        <div class="email-contact">
          <img src="@/assets/icon/email-icon.svg" alt="Email Icon" class="email-icon" />
          <a href="mailto:bds@vti.com.vn">info@biendongco.vn</a>
        </div>
      </div>

      <div class="address-section">
        <h3>Địa chỉ:</h3>
        <ul>
          <li>Trụ sở chính: 61 Lê Đức Thọ, Phường 7, Quận Gò Vấp, TP. HCM, Việt Nam</li>
          <li>
            Chi nhánh Hà Nội: 87 Tô Hiệu, Phường Nghĩa Đô, Quận Cầu Giấy, TP. Hà Nội, Việt
            Nam
          </li>
          <li>
            Chi nhánh Đà Nẵng: Lô A14, Đường số 7, Khu công nghệ cao Đà Nẵng, Hòa Liên,
            Hòa Vang, TP. Đà Nẵng, Việt Nam
          </li>
        </ul>
      </div>
    </div>

    <div class="content-right">
      <img :src="logoSrc" alt="VTI Solutions Logo" class="right-logo" />
    </div>
  </div>
</template>

<script>
import estecIcon from "@/assets/img/estec-icon.png";
export default {
  name: "HomePage",
  data() {
    return {
      logoSrc: estecIcon, // Thay đổi đường dẫn này thành đường dẫn thực tế của logo estec-icon.png
    };
  },
};
</script>

<style scoped>
.main-container {
  display: flex;
  height: calc(100vh - 60px);
  /* Sử dụng font tương tự thiết kế, ví dụ: 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif; */
  font-family: "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif;
  color: var(--text-color); /* Sử dụng biến màu chữ chính */
  background-color: white; /* Đảm bảo nền chính là trắng */
}

.content-left {
  flex: 2; /* Chiếm 2 phần */
  padding: 40px 60px; /* Tăng padding để có khoảng trống hơn */
  background-color: white; /* Nền trắng */
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box; /* Đảm bảo padding không làm tràn phần tử */
  text-align: left;
}

.contact-section h2 {
  color: var(--google-background-color); /* Màu xanh đậm hơn cho tiêu đề */
  font-size: 1.8em; /* Tăng kích thước font */
  margin-bottom: 15px;
  font-weight: 600; /* Làm chữ đậm hơn */
}

.contact-section p {
  line-height: 1.7; /* Tăng line-height cho dễ đọc */
  margin-bottom: 25px;
  color: var(--text-color);
  font-size: 0.95em;
}

.hotline,
.email-contact {
  display: flex;
  align-items: center;
  margin-bottom: 15px; /* Tăng khoảng cách giữa các dòng */
}

.hotline span {
  font-size: 2.2em; /* Kích thước số hotline lớn hơn */
  font-weight: bold;
  color: var(--primary-blue); /* Màu xanh của số hotline */
  margin-left: 15px; /* Tăng khoảng cách từ icon */
}

/* Điều chỉnh kích thước và màu sắc của icon */
.phone-icon,
.email-icon {
  width: 28px; /* Kích thước icon lớn hơn một chút */
  height: 28px;
  /* Dùng filter để thay đổi màu của SVG */
  filter: invert(30%) sepia(10%) saturate(600%) hue-rotate(180deg) brightness(80%)
    contrast(90%); /* Điều chỉnh để có màu xám đậm tương tự thiết kế */
  /* Hoặc nếu icon là PNG/JPEG, bạn không thể thay đổi màu bằng filter,
     cần đảm bảo icon gốc đã có màu xám phù hợp. */
}

.email-contact a {
  color: var(--text-color); /* Màu chữ email, có vẻ là màu text chính */
  text-decoration: none;
  margin-left: 15px;
  font-size: 1.1em; /* Kích thước font của email */
}

.email-contact a:hover {
  text-decoration: underline;
  color: var(--primary-blue); /* Màu khi hover */
}

.address-section {
  margin-top: 50px; /* Tăng khoảng cách với phần trên */
}

.address-section h3 {
  color: var(--text-color); /* Màu chữ cho tiêu đề địa chỉ */
  margin-bottom: 20px; /* Tăng khoảng cách */
  font-size: 1.1em;
  font-weight: 600;
}

.address-section ul {
  list-style: none;
  padding: 0;
}

.address-section ul li {
  margin-bottom: 12px; /* Tăng khoảng cách giữa các mục địa chỉ */
  position: relative;
  padding-left: 30px; /* Tăng khoảng trống cho dấu chấm bullet */
  font-size: 0.95em;
  line-height: 1.5;
}

.address-section ul li::before {
  content: "•"; /* Dấu chấm bullet */
  color: var(--primary-blue); /* Màu xanh của dấu chấm */
  font-size: 1.5em; /* Kích thước dấu chấm lớn hơn */
  position: absolute;
  left: 0;
  top: 0px; /* Điều chỉnh vị trí vertical của bullet */
  font-weight: bold;
}

.content-right {
  flex: 1; /* Chiếm 1 phần */
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative; /* Cho phép định vị tương đối cho các yếu tố bên trong */
}

.right-logo {
  max-width: 90%; /* Điều chỉnh kích thước logo lớn hơn một chút */
  max-height: 90%;
  object-fit: contain;
  animation: float 3s ease-in-out infinite; /* Thêm hiệu ứng bay bổng nhẹ nhàng cho logo */
}

/* Thêm các hình tròn mờ ở phía sau logo như trong thiết kế */
.content-right::before,
.content-right::after {
  content: "";
  position: absolute;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1); /* Màu trắng trong suốt */
  z-index: 0; /* Đảm bảo nằm dưới logo */
}

.content-right::before {
  width: 250px;
  height: 250px;
  top: 15%;
  left: 10%;
  transform: translateX(-50%) translateY(-50%);
}

.content-right::after {
  width: 400px;
  height: 400px;
  bottom: 10%;
  right: 5%;
  transform: translateX(50%) translateY(50%);
}

/* Keyframes cho hiệu ứng float */
@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
}

/* Responsive adjustments */
@media (max-width: 992px) {
  /* Điều chỉnh breakpoint cho tablet */
  .content-left {
    padding: 30px 40px;
  }

  .contact-section h2 {
    font-size: 1.6em;
  }

  .hotline span {
    font-size: 1.8em;
  }
}

@media (max-width: 768px) {
  .main-container {
    flex-direction: column;
  }

  .content-left,
  .content-right {
    flex: none;
    width: 100%;
  }

  .content-left {
    padding: 20px;
  }

  .content-right {
    min-height: 250px; /* Tăng chiều cao phần logo trên mobile */
    padding: 20px;
  }

  .contact-section h2 {
    font-size: 1.4em;
  }

  .hotline span {
    font-size: 1.6em;
  }

  .right-logo {
    max-width: 70%;
    max-height: 70%;
  }

  .content-right::before {
    width: 150px;
    height: 150px;
  }

  .content-right::after {
    width: 250px;
    height: 250px;
  }
}

@media (max-width: 480px) {
  /* Điều chỉnh cho mobile nhỏ hơn */
  .content-left {
    padding: 15px;
  }

  .contact-section h2 {
    font-size: 1.2em;
  }

  .hotline span {
    font-size: 1.4em;
  }

  .phone-icon,
  .email-icon {
    width: 22px;
    height: 22px;
  }

  .email-contact a {
    font-size: 1em;
  }
}
</style>
