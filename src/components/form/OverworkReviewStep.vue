<template>
  <div class="overwork-review-container">
    <h2 class="section-title">Xem và đánh giá dữ liệu của nhân sự quá số giờ làm</h2>

    <div class="filter-controls">
      <el-row :gutter="20">
        <el-col :span="24">
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
        </el-row>
      <el-button type="info" @click="resetFilters" class="reset-filters-button">Đặt lại Bộ lọc</el-button>
    </div>
    <div v-if="filteredOverworkData && filteredOverworkData.length > 0">
      <div class="table-wrapper">
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
      </div>
      <div class="summary-info">
        <p>Tổng số nhân sự bị quá số giờ làm hiển thị: <strong>{{ filteredOverworkData.length }}</strong></p>
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
  ElSelect,
  ElOption,
  // Loại bỏ ElDatePicker khỏi imports
  ElRow,
  ElCol,
} from 'element-plus';
import { computed, ref } from 'vue';

export default {
  name: "OverworkReviewStep",
  components: {
    ElTable,
    ElTableColumn,
    ElButton,
    ElEmpty,
    ElSelect,
    ElOption,
    // Loại bỏ ElDatePicker khỏi components
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
    const selectedNames = ref([]); // Mảng chứa các tên nhân sự được chọn (cho phép nhiều)
    // Loại bỏ selectedDates ref
    // const selectedDates = ref([]);

    // --- Lấy tất cả tên nhân sự duy nhất để hiển thị trong bộ lọc ---
    const allEmployeeNames = computed(() => {
      const names = new Set();
      props.overworkData.forEach(item => {
        names.add(item["employee"]);
      });
      return Array.from(names).sort();
    });

    // --- Format lại dữ liệu gốc thành dạng ngang cho bảng ---
    // Phần này vẫn giữ nguyên vì đây là bước chuẩn bị dữ liệu cơ bản
    const formattedOverworkForHorizontalTable = computed(() => {
      return props.overworkData.map(item => {
        const overworkDetails = {};
        item.overwork.forEach(ow => {
          overworkDetails[ow["date_val"]] = ow["hours"];
        });
        return {
          tenNhanSu: item["employee"],
          overworkDetails: overworkDetails,
        };
      });
    });

    // --- sortedUniqueDates giờ sẽ lấy tất cả các ngày từ dữ liệu gốc đã format ---
    // (trước đây có phụ thuộc vào filteredOverworkDataForDateColumns, giờ không còn nữa)
    const sortedUniqueDates = computed(() => {
      const dates = new Set();
      formattedOverworkForHorizontalTable.value.forEach(item => {
        if (item.overworkDetails) {
          Object.keys(item.overworkDetails).forEach(dateStr => {
            dates.add(dateStr);
          });
        }
      });
      return Array.from(dates).sort((a, b) => new Date(a) - new Date(b));
    });

    // --- Dữ liệu đã lọc cuối cùng để hiển thị trong bảng ---
    // Logic lọc theo ngày đã bị loại bỏ
    const filteredOverworkData = computed(() => {
      let data = formattedOverworkForHorizontalTable.value; // Bắt đầu với dữ liệu đã format

      // Lọc theo tên nhân sự
      if (selectedNames.value.length > 0) {
        data = data.filter(item => selectedNames.value.includes(item.tenNhanSu));
      }

      // Giữ lại bộ lọc này để loại bỏ các hàng không có overwork nào sau khi lọc theo tên
      data = data.filter(item => Object.keys(item.overworkDetails).length > 0);

      return data;
    });

    // --- Reset Bộ lọc ---
    const resetFilters = () => {
      selectedNames.value = [];
      // Loại bỏ selectedDates.value = [];
    };

    const completeReview = () => {
      emit('review-completed');
    };

    const resetWorkflow = () => {
      emit('reset-workflow');
    };

    return {
      selectedNames,
      // selectedDates không còn được trả về
      allEmployeeNames,
      sortedUniqueDates,
      filteredOverworkData,
      resetFilters,
      completeReview,
      resetWorkflow,
    };
  },
};
</script>

---

<style>
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

/* --- Styles cho Bộ lọc --- */
.filter-controls {
  width: 90%;
  max-width: 960px;
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

.filter-select {
  width: 100%;
}

/* Loại bỏ .filter-date-picker */
/* .filter-date-picker {
  width: 100%;
} */

.el-row {
  width: 100%;
  /* Điều chỉnh để el-col chỉ có một cái thì nó vẫn dàn ra */
  justify-content: center; /* Căn giữa nếu chỉ có một cột */
}

.reset-filters-button {
  align-self: flex-end;
}

/* --- End styles for Filter controls --- */

.table-wrapper {
  max-width: 1400px;
  overflow-x: auto;
  margin-bottom: 20px;
  box-sizing: border-box;
}

.overwork-table {
  width: 100%;
  min-width: fit-content;
  margin-bottom: 0;
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
    width: 100%; /* Giờ chỉ có một el-col, nó sẽ luôn chiếm 100% trên màn hình nhỏ */
    margin-bottom: 0; /* Không cần margin-bottom nếu chỉ có một cột */
  }
  /* Bỏ el-col:last-child vì giờ chỉ có 1 el-col*/
  /* .el-col:last-child {
    margin-bottom: 0;
  } */
  .reset-filters-button {
    align-self: stretch;
  }
  .table-wrapper {
    width: 100%;
  }
}
</style>