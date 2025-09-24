<template>
  <div class="warehouse_management_container">
    <el-table :data="listItemWarehouse" border style="width: 100%; height: 100%">
      <el-table-column fixed prop="item_id" label="ID" width="80" />
      <el-table-column prop="item_name" label="Tên hàng hóa" width="auto" />
      <el-table-column prop="item_code" label="Mã hàng hóa" width="auto" />
      <el-table-column prop="item_brand" label="Hãng" width="auto" />
      <el-table-column prop="item_type" label="Loại hàng hóa" width="auto" />
      <el-table-column prop="item_quantity" label="Số lượng" width="auto" />
      <el-table-column prop="seri_no" label="Seri No." width="auto" />
      <el-table-column fixed="right" label="Hành động" min-width="auto">
        <template #default="scope">
          <el-button type="success" size="small" @click="showDetail(scope.row)" :icon="View">
            {{ langStore.t("DetailAct") }}
          </el-button>
          <el-button type="primary" size="small" @click="showEditForm(scope.row)" :icon="EditPen">{{
            langStore.t("EditAct")
          }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <detail-popup v-model="isDetailVisible" title="Chi tiết hàng hóa">
      <div v-if="selectedItem">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="ID">{{ selectedItem.item_id }}</el-descriptions-item>
          <el-descriptions-item label="Tên hàng hóa">{{ selectedItem.item_name }}</el-descriptions-item>
          <el-descriptions-item label="Mã hàng hóa">{{ selectedItem.item_code }}</el-descriptions-item>
          <el-descriptions-item label="Hãng">{{ selectedItem.item_brand }}</el-descriptions-item>
          <el-descriptions-item label="Số lượng">{{ selectedItem.item_quantity }}</el-descriptions-item>
          <el-descriptions-item label="Số Seri">{{ selectedItem.seri_no }}</el-descriptions-item>
          <el-descriptions-item label="Vị trí">{{ selectedItem.location }}</el-descriptions-item>
          <el-descriptions-item label="Người nhập">{{ selectedItem.entered_by }}</el-descriptions-item>
          <el-descriptions-item label="Ngày nhập">{{ selectedItem.entered_date }}</el-descriptions-item>
          <el-descriptions-item label="Loại">{{ selectedItem.item_type }}</el-descriptions-item>
          <el-descriptions-item label="Đơn vị">{{ selectedItem.item_unit }}</el-descriptions-item>
          <el-descriptions-item label="Trạng thái">{{ selectedItem.item_status }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </detail-popup>

    <form-popup 
      v-model="isEditVisible"
      title="Chỉnh sửa thông tin hàng hóa"
      @submit="handleFormSubmit"
    >
      <el-form :model="editedItem" label-width="150px">
        <el-form-item label="Tên hàng hóa">
          <el-input v-model="editedItem.item_name"></el-input>
        </el-form-item>
        <el-form-item label="Mã hàng hóa">
          <el-input v-model="editedItem.item_code"></el-input>
        </el-form-item>
        <el-form-item label="Hãng">
          <el-input v-model="editedItem.item_brand"></el-input>
        </el-form-item>
        <el-form-item label="Số lượng">
          <el-input v-model="editedItem.item_quantity"></el-input>
        </el-form-item>
        <el-form-item label="Số seri">
          <el-input v-model="editedItem.seri_no"></el-input>
        </el-form-item>
        <el-form-item label="Vị trí">
          <el-input v-model="editedItem.location"></el-input>
        </el-form-item>
        <el-form-item label="Loại hàng hóa">
          <el-input v-model="editedItem.item_type"></el-input>
        </el-form-item>
      </el-form>
    </form-popup>
  </div>
</template>

<script>
import { ref } from "vue";
import { useLanguageStore } from "../../../stores/language";
import { EditPen, View } from "@element-plus/icons-vue";
import DetailPopup from "../../../components/popup/DetailPopup.vue";
import FormPopup from "../../../components/popup/FormPopup.vue";

export default {
  name: "WarehouseManagementDashboard",
  props: {
    listItem: {
      type: Array,
      default: () => [],
    },
  },
  components: {
    DetailPopup,
    FormPopup
  },
  setup() {
    const langStore = useLanguageStore();
    const listItemWarehouse = [
      {
        item_id: 1,
        item_name: "Miniature curcuit breaker 400 V 10kA, 2-pole, C, 10A",
        item_code: "55L4210-7CC",
        item_brand: "SIEMENS",
        item_quantity: "20",
        seri_no: "SN: 20230715-001-123",
        location: "Warehouse A",
        entered_by: "Phan Văn Hoàng Đông",
        item_type: "Dây điện",
        item_unit: "Cuộn",
        item_status: "Available",
        entered_date: "22/12/2025",
      },
      {
        item_id: 2,
        item_name:
          "RCBO, 6 kA, 1P+N, Type AC, 100 mA, C-Char, In: 10A, Un AC: 230 V, pigtail 600 mm, solid N",
        item_code: "5SU9406-1KK10",
        item_brand: "SIEMENS",
        item_quantity: "20",
        seri_no: "SN: 20230715-001-124",
        location: "Warehouse A",
        entered_by: "Phan Văn Hoàng Đông",
        item_type: "Hardware",
        item_unit: "kg",
        item_status: "Available",
        entered_date: "22/12/2025",
      },
      {
        item_id: 3,
        item_name:
          "RCBO, 6 kA, 1P+N, Type AC, 100 mA, C-Char, In: 20A, Un AC: 230 V, pigtail 600 mm, solid N",
        item_code: "5SU9406-1KK20",
        item_brand: "SIEMENS",
        item_quantity: "20",
        seri_no: "SN: 20230715-001-125",
        location: "Warehouse A",
        entered_by: "Phan Văn Hoàng Đông",
        item_type: "PLC",
        item_unit: "kg",
        item_status: "Available",
        entered_date: "22/12/2025",
      },
      {
        item_id: 4,
        item_name:
          "RCBO, 6 kA, 1P+N, Type AC, 100 mA, C-Char, In: 20A, Un AC: 230 V, pigtail 600 mm, solid N",
        item_code: "5SU9406-1KK20",
        item_brand: "SIEMENS",
        item_quantity: "20",
        seri_no: "SN: 20230715-001-126",
        location: "Warehouse A",
        entered_by: "Phan Văn Hoàng Đông",
        item_type: "Hardware",
        item_unit: "kg",
        item_status: "Available",
        entered_date: "22/12/2025",
      },
      {
        item_id: 5,
        item_name:
          "SITOP PSU100S 12 V/14 A Stabilized power supply input: 120/230 V AC, output: 12 V DC/14 A",
        item_code: "6EP1323-2BA00",
        item_brand: "SIEMENS",
        item_quantity: "20",
        seri_no: "SN: 20230715-001-127",
        location: "Warehouse A",
        entered_by: "Phan Văn Hoàng Đông",
        item_type: "Hardware",
        item_unit: "kg",
        item_status: "Available",
        entered_date: "22/12/2025",
      },
      {
        item_id: 6,
        item_name:
          "SITOP PSU100S 12 V/14 A Stabilized power supply input: 120/230 V AC, output: 12 V DC/14 A",
        item_code: "6EP1323-2BA00",
        item_brand: "SIEMENS",
        item_quantity: "20",
        seri_no: "SN: 20230715-001-128",
        location: "Warehouse A",
        entered_by: "Phan Văn Hoàng Đông",
        item_type: "Hardware",
        item_unit: "kg",
        item_status: "Available",
        entered_date: "22/12/2025",
      },
    ];

    const isDetailVisible = ref(false);
    const selectedItem = ref(null);

    const isEditVisible = ref(false);
    const editedItem = ref({});

    const showDetail = (item) => {
      selectedItem.value = item;
      isDetailVisible.value = true;
    }

    const showEditForm = (item) => {
      // Copy data to avoid changing directly on the board
      editedItem.value = { ...item };
      isEditVisible.value = true;
    }

    const handleFormSubmit = () => {
      console.log('Send request success');
      
    }

    return {
      langStore,
      listItemWarehouse,
      isDetailVisible,
      selectedItem,
      showDetail,
      EditPen,
      View,
      isEditVisible,
      editedItem,
      showEditForm,
      handleFormSubmit,
    };
  },
};
</script>

<style>
.warehouse_management_container {
  padding: 20px;
  height: 100vh;
  display: flex;
  background-color: #f9f9f9;
  flex-direction: column;
  overflow: scroll;
  overflow-x: hidden;
}
</style>
