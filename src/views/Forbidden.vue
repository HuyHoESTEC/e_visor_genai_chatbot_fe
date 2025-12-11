<template>
    <div class="forbidden-container">
        <div class="forbidden-content">
            <el-result
                icon="error"
                title="403 - Access Denied"
                sub-title="Bạn không có quyền truy cập vào trang này."
            >
                <template #extra>
                    <el-button type="primary" size="large" @click="$router.push('/')">
                        <el-icon><HomeFilled /></el-icon>
                        Về Trang Chủ
                    </el-button>
                </template>
            </el-result>
            <p class="error-tip">
                Vui lòng liên hệ quản trị viên để được cấp quyền vào trang này. 
            </p>
        </div>
    </div>
</template>

<script>
import { HomeFilled } from '@element-plus/icons-vue';

export default {
    name: 'Forbidden',
    components: {
        HomeFilled,
    },
}
</script>

<style scoped>
.forbidden-container {
  display: flex;
  justify-content: center;
  align-items: center;
  /* Đảm bảo chiếm toàn bộ không gian có sẵn (ví dụ: màn hình hoặc vùng chứa chính) */
  height: 100%;
  background-color: #f5f7fa; /* Màu nền nhẹ */
}

.forbidden-content {
  background-color: #ffffff;
  padding: 40px 60px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.error-tip {
  margin-top: 30px;
  color: #909399;
  font-size: 14px;
}

/* Tùy chỉnh icon Result để lớn hơn một chút nếu cần */
:deep(.el-result__icon) i {
    font-size: 72px; 
}
</style>