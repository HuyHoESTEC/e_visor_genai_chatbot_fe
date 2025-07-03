<template>
  <div class="overwork-review-container">
    <h2 class="section-title">Xem và đánh giá dữ liệu của nhân sự sau khi ghép nối</h2>

    <div class="filter-controls">
      <el-row :gutter="20">
        <el-col :span="12">
          <label for="name-filter" class="filter-label">Lọc theo Tên Nhân Sự:</label>
          <el-select
            id="name-filter"
            v-model="selectedNames"
            multiple
            filterable
            placeholder="Chọn tên nhân sự"
            class="filter-select"
            clearable
          >
            <el-option
              v-for="name in allEmployeeNames"
              :key="name"
              :label="name"
              :value="name"
            ></el-option>
          </el-select>
        </el-col>
        <el-col :span="12">
          <label for="date-filter" class="filter-label">Lọc theo Ngày:</label>
          <el-date-picker
            id="date-filter"
            v-model="selectedDates"
            type="daterange"
            range-separator="Đến"
            start-placeholder="Ngày bắt đầu"
            end-placeholder="Ngày kết thúc"
            class="filter-date-picker"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            clearable
          ></el-date-picker>
        </el-col>
      </el-row>
      <el-button type="info" @click="resetFilters" class="reset-filters-button">Đặt lại Bộ lọc</el-button>
    </div>
    <div v-if="filteredOverworkData && filteredOverworkData.length > 0">
      <el-table
        :data="filteredOverworkData"
        style="width: 100%"
        border
        class="overwork-table"
        :header-cell-style="{ textAlign: 'center' }"
        :cell-style="{ textAlign: 'center' }"
      >
        <el-table-column prop="tenNhanSu" label="Tên Nhân Sự" width="200" fixed></el-table-column>

        <el-table-column
          v-for="date in sortedUniqueDates"
          :key="date"
          :label="date"
          :width="120"
        >
          <template #default="scope">
            <span v-if="scope.row.overworkDetails && scope.row.overworkDetails[date]">
              {{ scope.row.overworkDetails[date] }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>

      </el-table>
      <div class="summary-info">
        <p>Tổng số nhân sự có overwork hiển thị: <strong>{{ filteredOverworkData.length }}</strong></p>
      </div>
    </div>
    <div v-else class="no-data-message">
      <el-empty description="Không tìm thấy dữ liệu Overwork sau khi ghép nối hoặc dữ liệu không khớp với bộ lọc."></el-empty>
    </div>

    <div class="action-bar">
      <el-button type="primary" @click="completeReview">Hoàn Thành</el-button>
      <el-button @click="resetWorkflow">Quay Lại Bước Đầu</el-button>
    </div>
  </div>
</template>

<script>
import {
  ElTable,
  ElTableColumn,
  ElButton,
  ElEmpty,
  ElSelect,     // Thêm ElSelect
  ElOption,     // Thêm ElOption
  ElDatePicker, // Thêm ElDatePicker
  ElRow,        // Thêm ElRow
  ElCol,        // Thêm ElCol
} from 'element-plus';
import { computed, ref } from 'vue'; // Thêm ref

export default {
  name: "OverworkReviewStep",
  components: {
    ElTable,
    ElTableColumn,
    ElButton,
    ElEmpty,
    ElSelect,
    ElOption,
    ElDatePicker,
    ElRow,
    ElCol,
  },
  props: {
    overworkData: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['review-completed', 'reset-workflow'],
  setup(props, { emit }) {
    // --- States cho Bộ lọc ---
    const selectedNames = ref([]); // Mảng chứa các tên nhân sự được chọn
    const selectedDates = ref([]); // Mảng chứa [ngày_bắt_đầu, ngày_kết_thúc]

    // --- Lấy tất cả tên nhân sự duy nhất để hiển thị trong bộ lọc ---
    const allEmployeeNames = computed(() => {
      const names = new Set();
      props.overworkData.forEach(item => {
        names.add(item["employee"]);
      });
      return Array.from(names).sort(); // Sắp xếp theo ABC
    });

    // --- Format lại dữ liệu gốc thành dạng ngang cho bảng ---
    const formattedOverworkForHorizontalTable = computed(() => {
      return props.overworkData.map(item => {
        const overworkDetails = {};
        item.overwork.forEach(ow => {
          // Lưu giờ overwork vào thuộc tính có tên là ngày
          overworkDetails[ow["date_val"]] = ow["hours"];
        });
        return {
          tenNhanSu: item["employee"],
          overworkDetails: overworkDetails, // Đối tượng chứa { "YYYY-MM-DD": hours }
        };
      });
    });

    // Dữ liệu được lọc theo ngày riêng, dùng để xác định cột ngày
    // Mục đích chính là làm rỗng các overworkDetails không nằm trong khoảng ngày
    // mà không loại bỏ toàn bộ hàng nhân sự ngay lập tức.
    const filteredOverworkDataForDateColumns = computed(() => {
      let data = formattedOverworkForHorizontalTable.value;

      if (selectedDates.value && selectedDates.value.length === 2) {
        const [rawStartDate, rawEndDate] = selectedDates.value;
        // Đảm bảo startDate là đầu ngày và endDate là cuối ngày
        const startDate = new Date(rawStartDate + 'T00:00:00');
        const endDate = new Date(rawEndDate + 'T23:59:59');

        data = data.map(item => {
          const newOverworkDetails = {};
          for (const dateStr in item.overworkDetails) {
            const currentDate = new Date(dateStr + 'T12:00:00'); // Dùng 12:00:00 để tránh lỗi múi giờ

            // Kiểm tra xem ngày có nằm trong khoảng đã chọn không
            if (currentDate >= startDate && currentDate <= endDate) {
              newOverworkDetails[dateStr] = item.overworkDetails[dateStr];
            }
          }
          // Trả về item với overworkDetails đã lọc.
          // Tên nhân sự vẫn được giữ lại dù không có overwork nào khớp với ngày.
          return { ...item, overworkDetails: newOverworkDetails };
        });
      }
      return data;
    });

    // --- Lấy tất cả các ngày duy nhất từ dữ liệu đã lọc theo ngày và sắp xếp ---
    // Chỉ các ngày có dữ liệu sau khi lọc ngày mới được hiển thị làm cột.
    const sortedUniqueDates = computed(() => {
      const dates = new Set();
      filteredOverworkDataForDateColumns.value.forEach(item => {
        if (item.overworkDetails) {
          Object.keys(item.overworkDetails).forEach(dateStr => {
            // Chỉ thêm ngày nếu có giờ overwork (không phải undefined sau khi lọc)
            if (item.overworkDetails[dateStr] !== undefined) {
              dates.add(dateStr);
            }
          });
        }
      });
      return Array.from(dates).sort((a, b) => new Date(a) - new Date(b));
    });

    // --- Dữ liệu đã lọc cuối cùng để hiển thị trong bảng ---
    const filteredOverworkData = computed(() => {
      let data = filteredOverworkDataForDateColumns.value; // Bắt đầu với dữ liệu đã được xử lý theo ngày

      // Lọc theo tên nhân sự
      if (selectedNames.value.length > 0) {
        data = data.filter(item => selectedNames.value.includes(item.tenNhanSu));
      }

      // Cuối cùng, lọc bỏ những hàng không có overwork nào khớp sau khi áp dụng tất cả các bộ lọc.
      // Điều này loại bỏ các hàng nhân sự mà không có overwork nào trong các cột hiển thị.
      data = data.filter(item => Object.keys(item.overworkDetails).length > 0);

      return data;
    });

    // --- Reset Bộ lọc ---
    const resetFilters = () => {
      selectedNames.value = [];
      selectedDates.value = [];
    };

    const completeReview = () => {
      emit('review-completed');
    };

    const resetWorkflow = () => {
      emit('reset-workflow');
    };

    return {
      selectedNames,         // Cần trả về để template sử dụng
      selectedDates,         // Cần trả về để template sử dụng
      allEmployeeNames,      // Cần trả về để template sử dụng
      sortedUniqueDates,     // Cần trả về để template sử dụng
      filteredOverworkData,  // Cần trả về để template sử dụng
      resetFilters,          // Cần trả về để template sử dụng
      completeReview,
      resetWorkflow,
    };
  },
};
</script>

---

<style>
/* CSS đã được tối ưu hóa cho dạng ngang, và có thêm styles cho phần filter controls */
.overwork-review-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  flex-grow: 1;
  width: 100%;
  box-sizing: border-box;
  overflow-y: auto;
}

.section-title {
  text-align: center;
  color: #409eff;
  margin-bottom: 20px;
  font-size: 1.8em;
  font-weight: 600;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 15px;
  width: 100%;
}

/* --- New styles for Filter controls --- */
.filter-controls {
  width: 90%;
  max-width: 960px; /* Giới hạn chiều rộng để bộ lọc không quá lớn */
  margin-bottom: 20px;
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background-color: #fcfcfc;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.filter-label {
  display: block;
  font-size: 0.9em;
  color: #606266;
  margin-bottom: 5px;
  text-align: left;
}

.filter-select,
.filter-date-picker {
  width: 100%;
}

.el-row {
  width: 100%;
}

.reset-filters-button {
  align-self: flex-end; /* Đặt nút ở góc phải dưới của bộ lọc */
}

/* --- End new styles for Filter controls --- */

.overwork-table {
  width: 90%; /* Ví dụ: chiếm 90% chiều rộng của container */
  max-width: 1200px; /* Giới hạn chiều rộng tối đa */
  margin-bottom: 20px;
}

.summary-info {
  font-size: 1.1em;
  font-weight: bold;
  color: #333;
  margin-top: 10px;
  text-align: center;
}

.action-bar {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.no-data-message {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .filter-controls {
    width: 100%;
    padding: 15px;
  }
  .el-col {
    width: 100%; /* Trên màn hình nhỏ, các cột lọc sẽ xếp chồng */
    margin-bottom: 15px;
  }
  .el-col:last-child {
    margin-bottom: 0;
  }
  .reset-filters-button {
    align-self: stretch; /* Nút kéo dài toàn bộ chiều rộng */
  }
  .overwork-table {
    width: 100%; /* Trên màn hình nhỏ, bảng có thể chiếm toàn bộ chiều rộng */
  }
}
</style>