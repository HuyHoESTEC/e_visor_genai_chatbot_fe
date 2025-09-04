<template>
  <div class="work-report-wrapper">
    <div class="split-screen">
      <div class="left-panel">
        <div class="input-section">
          <label for="old-week">Nhập số tuần cũ:</label>
          <input type="number" id="old-week" v-model="oldWeek" />
        </div>

        <div class="task-list-section">
          <h3>Danh sách các đầu việc của tuần trước:</h3>
          <div
            v-for="(task, index) in oldWeekTasks"
            :key="`old-task-${index}`"
            class="task-item"
          >
            <input
              type="text"
              v-model="oldWeekTasks[index]"
              :placeholder="`Đầu việc ${index + 1}`"
            />
            <button v-on:click="removeTask('old', index)" class="remove-btn">Xóa</button>
          </div>
          <button v-on:click="addTask('old')" class="add-btn">
            Thêm đầu việc tuần cũ
          </button>
        </div>

        <div class="input-section">
          <label for="new-week">Nhập số tuần mới:</label>
          <input type="number" id="new-week" v-model="newWeek" />
        </div>

        <div class="task-list-section">
          <h3>Danh sách các đầu việc của tuần tiếp theo:</h3>
          <div
            v-for="(task, index) in newWeekTasks"
            :key="`new-task-${index}`"
            class="task-item"
          >
            <input
              type="text"
              v-model="newWeekTasks[index]"
              :placeholder="`Đầu việc ${index + 1}`"
            />
            <button v-on:click="removeTask('new', index)" class="remove-btn">Xóa</button>
          </div>
          <button v-on:click="addTask('new')" class="add-btn">
            Thêm đầu việc tuần mới
          </button>
        </div>
      </div>

      <div class="right-panel">
        <div class="generated-text-area">
          <h3>Báo cáo công việc tự động tạo:</h3>
          <pre>{{ generatedReport }}</pre>
        </div>
        <button v-on:click="copyReport" class="copy-btn">Sao chép báo cáo</button>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref } from "vue";

export default {
  name: "RndWorkReport",
  setup() {
    const oldWeek = ref(null);
    const newWeek = ref(null);
    const oldWeekTasks = ref([""]);
    const newWeekTasks = ref([""]);

    const generatedReport = computed(() => {
      let report = `Em xin phép gửi anh báo cáo công việc với những công việc đã làm trong tuần và kế hoạch công việc trong tuần tới như sau:\n`;

      if (oldWeek.value) {
        report += `I. Báo cáo công việc tuần ${oldWeek.value}:\n`;
        oldWeekTasks.value.forEach((task, index) => {
          if (task.trim() !== "") {
            report += ` ${index + 1}. ${task.trim()}\n`;
          }
        });
      }

      if (newWeek.value) {
        report += `\n II. Kế hoạch công việc tuần ${newWeek.value}:\n`;
        newWeekTasks.value.forEach((task, index) => {
          if (task.trim() !== "") {
            report += ` ${index + 1}. ${task.trim()}\n`;
          }
        });
      }

      return report;
    });

    const addTask = (type) => {
        if (type === 'old') {
            oldWeekTasks.value.push('');
        } else {
            newWeekTasks.value.push('');
        }
    };

    const removeTask = (type, index) => {
        if (type === 'old') {
            oldWeekTasks.value.splice(index, 1);
        } else {
            newWeekTasks.value.splice(index, 1);
        }
    };

    const copyReport = async () => {
        try {
            await navigator.clipboard.writeText(generatedReport.value);
            alert('Đã sao chép báo cáo vào clipboard!');
        } catch (err) {
            console.error('Không thể sao chép báo cáo: ', err);
            alert('Không thể sao chép báo cáo. Vui lòng thử lại hoặc sao chép báo cáo thủ công.');
        }
    };

    return {
      oldWeek,
      newWeek,
      oldWeekTasks,
      newWeekTasks,
      generatedReport,
      addTask,
      removeTask,
      copyReport,
    };
  },
};
</script>

<style scoped>
.work-report-wrapper {
  font-family: Arial, sans-serif;
  padding: 20px;
  height: calc(100vh - 60px);
  color: var(--text-color); /* Sử dụng biến màu chữ chính */
  background-color: white;
}

.split-screen {
  display: flex;
  gap: 20px;
}

.left-panel,
.right-panel {
  flex: 1;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.input-section {
  margin-bottom: 20px;
}

.input-section label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.input-section input[type="number"],
.task-item input[type="text"] {
  width: calc(100% - 10px);
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 5px;
}

.task-list-section h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #333;
}

.task-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.task-item input[type="text"] {
  flex-grow: 1;
  margin-right: 10px;
}

.add-btn, .remove-btn, .copy-btn {
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  margin-top: 5px;
}

.add-btn {
  background-color: #28a745;
  color: white;
}

.add-btn:hover {
  background-color: #218838;
}

.remove-btn {
  background-color: #dc3545;
  color: white;
}

.remove-btn:hover {
  background-color: #c82333;
}

.generated-text-area {
  background-color: #e9ecef;
  border: 1px solid #ced4da;
  padding: 15px;
  border-radius: 4px;
  min-height: 300px;
  white-space: pre-wrap;
  word-wrap: break-word;
  margin-bottom: 15px;
  text-align: left;
}

.generated-text-area pre {
  margin: 0;
  font-family: inherit;
}

.copy-btn {
  background-color: #007bff;
  color: white;
  width: 100%;
}

.copy-btn:hover {
  background-color: #0056b3;
}
</style>
