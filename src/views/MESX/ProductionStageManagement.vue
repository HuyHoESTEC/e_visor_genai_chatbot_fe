<template>
  <div class="production-stage-container">
    <div class="ptm-split-screen">
      <div class="left-panel">
        <h2>Nhập thông tin các công đoạn</h2>
        <div
          v-for="(stage, index) in productionStages"
          :key="index"
          class="stage-input-card"
        >
          <div class="input-group">
            <label :for="`stage-name-${index}`">Tên công đoạn:</label>
            <input
              type="text"
              :id="`stage-name-${index}`"
              v-model="stage.name"
              placeholder="Nhập tên công đoạn"
            />
          </div>

          <div class="input-group">
            <label :for="`stage-description-${index}`">Mô tả:</label>
            <textarea
              :id="`stage-description-${index}`"
              v-model="stage.description"
              placeholder="Nhập mô tả công việc"
              required
            />
          </div>

          <div class="input-group">
            <label :for="`stage-assignee-${index}`">Người thực hiện:</label>
            <select :id="`stage-assignee-${index}`" v-model="stage.assignee">
              <option value="" disabled>Chọn người thực hiện</option>
              <option v-for="person in assignees" :key="person.id" :value="person.name">
                {{ person.name }}
              </option>
            </select>
          </div>
          <button v-on:click="removeStage(index)" class="remove-btn">
            Xóa công đoạn
          </button>
        </div>
        <button v-on:click="addStage" class="add-btn">Thêm công đoạn</button>
      </div>

      <div class="right-panel">
        <h2>Quy trình sản xuất</h2>
        <div v-if="validProductionStages.length === 0" class="placeholder-text">
          Chưa có công đoạn nào để thêm.
        </div>
        <div v-else class="flow-chart">
          <div
            v-for="(stage, index) in validProductionStages"
            :key="`flow-${index}`"
            class="flow-card-wrapper"
          >
            <div class="flow-card">
                <ul>
                    <li><strong>Tên công đoạn:</strong> {{ stage.name }}</li>
                    <li><strong>Mô tả:</strong> {{ stage.description }}</li>
                    <li><strong>Người thực hiện:</strong> {{ stage.assignee }}</li>
                </ul>
            </div>
            <div v-if="index < validProductionStages.length - 1" class="flow-arrow"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref } from 'vue';

export default {
  watch: {},
  name: "ProductionStageManagement",
  setup() {
    const assignees = ref([
        { id: 1, name: 'Hồ Nhật Huy' },
        { id: 2, name: 'Võ Lý Hoàng Hoan' },
        { id: 3, name: 'Hoàng Tấn Nguyên' },
        { id: 4, name: 'Đoàn Ngọc Minh Thắng' },
    ]);

    const productionStages = ref([
        { 
            name: '', 
            description: '', 
            assignee: ''
        }
    ]);

    const validProductionStages = computed(() => {
        return productionStages.value.filter(stage => stage.name.trim() !== '');
    });

    const addStage = () => {
        productionStages.value.push({ name: '', description: '', assignee: '' });
    };

    const removeStage = (index) => {
        if (productionStages.value.length > 1) {
            productionStages.value.splice(index, 1);
        }
    };

    return {
        assignees,
        productionStages,
        validProductionStages,
        addStage,
        removeStage,
    };
  },
};
</script>

<style scoped>
.production-stage-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: white; /* Nền tối giống trong hình */
  color: #2c2c6a; /* Chữ trắng */
  overflow: scroll;
  overflow-x: hidden;
}

.ptm-split-screen {
  display: flex;
  flex: 1; /* Chiếm toàn bộ chiều cao còn lại */
  gap: 20px;
  padding: 20px;
}

.left-panel {
  flex: 1;
  background-color: whitesmoke;
  border-radius: 8px;
  padding: 20px;
  overflow-y: auto; /* Thêm scroll khi nội dung dài */
}

.right-panel {
  flex: 1;
  background-color: whitesmoke;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
}

h2 {
  border-bottom: 2px solid #444;
  padding-bottom: 10px;
  margin-top: 0;
}

.stage-input-card {
  background-color: #CAD5E2;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
  border: 1px solid #444;
}

.input-group {
  margin-bottom: 10px;
}

label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
  color: #2c2c6a;
}

input[type="text"], textarea, select {
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #444;
  background-color: white;
  color: black;
  box-sizing: border-box;
}

textarea {
  resize: vertical;
}

.add-btn, .remove-btn {
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  margin-top: 10px;
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
  float: right;
}

.remove-btn:hover {
  background-color: #c82333;
}

/* CSS cho biểu đồ quy trình */
.flow-chart {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.flow-card-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.flow-card {
  width: 90%;
  max-width: 400px; /* Chiều rộng tối đa của mỗi thẻ công đoạn */
  background-color: #CAD5E2;
  border: 1px solid #444;
  border-radius: 8px;
  padding: 15px;
  box-sizing: border-box;
  text-align: start;
}

.flow-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.flow-card ul li {
  margin-bottom: 5px;
  line-height: 1.4;
}

.flow-arrow {
  width: 2px;
  height: 50px; /* Chiều dài mũi tên */
  background-color: #888;
  position: relative;
  margin: 10px 0;
}

.flow-arrow::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 10px solid #888;
}

.placeholder-text {
  margin-top: 50px;
  color: #888;
  text-align: center;
  font-style: italic;
}
</style>

