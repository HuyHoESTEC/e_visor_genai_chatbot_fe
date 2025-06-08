<template>
  <div class="main-container">
    <div class="content-header">
      <h2>Analysis and review of contracts</h2>
    </div>
    <div class="content-body">
      <contract-upload-area />
      <chat-window />
      <chat-input />
    </div>
  </div>
</template>

<script>
import ContractUploadArea from '../../components/contract/ContractUploadArea.vue';
import ChatWindow from '../../components/chat/ChatWindow.vue';
import ChatInput from '../../components/chat/ChatInput.vue';

export default {
  name: 'ContractReviewPage',
  components: {
    'contract-upload-area': ContractUploadArea,
    'chat-window': ChatWindow,
    'chat-input': ChatInput
  }
}
</script>

<style scoped>
.main-content {
  flex-grow: 1; /* Cho phép nó chiếm hết không gian còn lại */
  display: flex;
  flex-direction: column;
  background-color: #f9f9f9;
  padding: 30px;
}

.content-header {
  margin-bottom: 20px;
  color: #333;
}

.content-body {
  display: flex;
  flex-grow: 1; /* Cho phép body chiếm hết không gian giữa header và footer */
  gap: 30px; /* Khoảng cách giữa hai cột */
  margin-bottom: 20px; /* Khoảng cách với input area */
}

/* Kích thước cột bằng nhau */
.content-body > * {
  flex: 1;
}
</style>