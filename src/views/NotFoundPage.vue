<template>
  <div class="not-found-container">
    <h1 class="error-code">404</h1>
    <p class="not-found-text">Not Found</p>
    <p class="explanation-text">The resource request could not be found on this server!</p>
  </div>
</template>

<script>
export default {
  name: 'NotFoundPage',
}
</script>

<style scoped>
.not-found-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh; /* Chiếm toàn bộ chiều cao của viewport */
  background-color: #ffffff; /* Nền trắng */
  color: #333; /* Màu chữ mặc định */
  font-family: sans-serif; /* Font cơ bản */
  text-align: center; /* Căn giữa văn bản */
  padding: 20px; /* Thêm padding nếu nội dung quá sát viền */
  box-sizing: border-box; /* Đảm bảo padding không làm tăng kích thước tổng thể */
}

.error-code {
  font-size: 10em; /* Kích thước font lớn cho "404" */
  font-weight: bold;
  color: #444; /* Màu xám đậm */
  margin: 0; /* Bỏ margin mặc định để kiểm soát khoảng cách tốt hơn */
  line-height: 1; /* Điều chỉnh chiều cao dòng */
}

.not-found-text {
  font-size: 2em;
  color: #444; /* Màu xám đậm */
  margin: 0.5em 0; /* Khoảng cách trên dưới */
}

.explanation-text {
  font-size: 1em;
  color: #777; /* Màu xám nhạt hơn */
  margin-top: 1em;
  max-width: 500px; /* Giới hạn chiều rộng để văn bản không quá dài */
}
</style>