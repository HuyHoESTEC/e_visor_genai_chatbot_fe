<template>
  <div class="imported-goods-managment-container">
    <div class="header-actions">
        <el-button type="primary" :icon="Plus" v-on:click="showCreateForm">
            Tạo mới
        </el-button>
        <el-button type="success" :icon="Download">
            Xuất dữ liệu
        </el-button>
    </div>

    <ItemFormDialog
        v-model="isFormVisible"
        title="Phiếu xuất kho hàng hóa"
        @submit="handleFormSubmit"
    >
        <el-form :model="formData" label-width="120px">
            <el-form-item label="Tên hàng hóa">
                <el-input v-model="formData.item_name"></el-input>
            </el-form-item>
            <el-form-item label="Mã hàng hóa">
                <el-input v-model="formData.item_code" class="input-with-select">
                    <template #append>
                        <el-dropdown>
                            <el-button>
                                Tùy chọn
                                <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                            </el-button>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item>Option 1</el-dropdown-item>
                                    <el-dropdown-item>Option 2</el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                </el-input>
            </el-form-item>
            <el-form-item label="Hãng">
                <el-input v-model="formData.item_brand"></el-input>
            </el-form-item>
            <el-form-item label="Số lượng">
                <el-input-number v-model="formData.item_quantity" :min=0></el-input-number>
            </el-form-item>
            <el-form-item label="Vị trí">
                <el-input v-model="formData.location" />
            </el-form-item>
            <el-form-item label="Số Seri">
                <el-input v-model="formData.seri_no" />
            </el-form-item>
            <el-form-item label="Ngày nhập">
                <el-date-picker
                    v-model="formData.entered_date"
                    type="date"
                    placeholder="Chọn ngày nhập"
                    value-format="YYYY-MM-DD"
                />
            </el-form-item>
            <el-form-item label="Loại">
                <el-input v-model="formData.item_type" />
            </el-form-item>
            <el-form-item label="Đơn vị">
                <el-input v-model="formData.item_unit" />
            </el-form-item>
        </el-form>
    </ItemFormDialog>

    <div class="filter-section">
        <el-row :gutter="20">
            <el-col :span="4">
                <el-input placeholder="Mã kế hoạch" />
            </el-col>
            <el-col :span="4">
                <el-input placeholder="Khách hàng" style="width: 100%" />
            </el-col>
            <el-col :span="4">
                <el-input placeholder="PT vận chuyển" style="width: 100%" />
            </el-col>
            <el-col :span="4">
                <el-input placeholder="Packing list" />
            </el-col>
            <el-col :span="4">
                <el-input placeholder="Số invoice" />
            </el-col>
            <el-col :span="4" class="filter-buttons">
                <el-button>Hủy</el-button>
                <el-button type="primary">Lọc</el-button>
            </el-col>
        </el-row>
    </div>
    <div class="content-section">
        <el-tabs v-model="activeTab" type="border-card">
            <el-tab-pane label="Tất cả" name="all" />
            <el-tab-pane label="Lưu nháp" name="draft" />
            <el-tab-pane label="Chờ phê duyệt" name="pending" />
            <el-tab-pane label="Đang thực hiện" name="in-progress" />
            <el-tab-pane label="Hoàn thành" name="completed" />
            <el-tab-pane label="Từ chối" name="rejected" />
            <el-tab-pane label="Đã hủy" name="cancelled" />
        </el-tabs>
        <el-table :data="tableData" border>
            <el-table-column type="selection" width="55" />
            <el-table-column prop="plan_code" label="Mã kế hoạch" sortable />
            <el-table-column prop="customer_code" label="Mã khách hàng" sortable />
            <el-table-column prop="customer_name" label="Tên khách hàng" sortable />
            <el-table-column prop="shipping_method" label="PT vận chuyển" />
            <el-table-column prop="export_date" label="Ngày KH xuất hàng" />
            <el-table-column prop="invoice_number" label="Số invoice" />
            <el-table-column prop="packing_list" label="Packing list" />
            <el-table-column label="Hành động" width="100">
                <template #default>
                    <el-button type="info" :icon="View" circle />
                </template>
            </el-table-column>
        </el-table>

        <div class="table-footer">
            <div class="pagination-info">
                <span>Số dòng mỗi trang 20</span>
            </div>
            <div class="pagination-summary">
                <span>1-2 trên tổng số 2</span>
                <el-button-group>
                    <el-button :icon="ArrowLeftBold" />
                    <el-button :icon="ArrowRightBold" />
                </el-button-group>
                <el-pagination layout="pager" :total="100" />
            </div>
        </div>
    </div>
  </div>
</template>

<script>
import { Plus, Download, View, ArrowLeftBold, ArrowRightBold, ArrowDown } from '@element-plus/icons-vue';
import { ref } from 'vue';
import ItemFormDialog from '../../../components/dialog/ItemFormDialog.vue';

export default {
  name: "ExportedGoodsManagement",
  components: {
    Plus,
    Download,
    View,
    ArrowLeftBold,
    ArrowRightBold,
    ArrowDown,
    ItemFormDialog
  },
  setup() {
    const activeTab = ref('all');
    const tableData = [
        {
            plan_code: 'XH240308.02',
            customer_code: '95018',
            customer_name: 'YOUNGCHANG GST COMPANY LIMITED',
            shipping_method: 'AIR',
            export_date: '2025-09-23', // Thêm ngày xuất hàng
            invoice_number: 'VKR002',
            packing_list: 'P123',
        },
        {
            plan_code: 'XH240308.01',
            customer_code: '95018',
            customer_name: 'YOUNGCHANG GST COMPANY LIMITED',
            shipping_method: 'AIR',
            export_date: '2025-09-22',
            invoice_number: 'VKR001',
            packing_list: 'P124',
        }
    ];

    const isFormVisible = ref(false);
    const formData = ref({
        item_name: '',
        item_code: '',
        item_brand: '',
        item_quantity: 0,
        location: '',
        seri_no: '',
        entered_date: '',
        item_type: '',
        item_unit: '',
    });

    const showCreateForm = () => {
        formData.value = {
            item_name: '',
            item_code: '',
            item_brand: '',
            item_quantity: 0,
            location: '',
            seri_no: '',
            entered_date: '',
            item_type: '',
            item_unit: '',
        };
        isFormVisible.value = true;
    };
    const handleFormSubmit = () => {
        console.log('Send request success', formData.value);
        isFormVisible.value = false;
    }

    return {
        Plus,
        Download,
        View,
        ArrowLeftBold,
        ArrowRightBold,
        ArrowDown,
        activeTab,
        tableData,
        isFormVisible,
        formData,
        showCreateForm,
        handleFormSubmit
    }
  }
};
</script>

<style>
.imported-goods-managment-container {
  padding: 20px;
  height: 100vh;
  display: flex;
  background-color: #f9f9f9;
  flex-direction: column;
  overflow: scroll;
  overflow-x: hidden;
}
.header-actions {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 20px;
}
.filter-section {
  margin-bottom: 20px;
}
.filter-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}
.content-section {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
}
.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}
.pagination-summary {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
