<template>
    <div style="text-align: center; padding-top: 50px;">
        <h1>403 - Access Denied</h1>
        <p>Bạn không có quyền truy cấp vào trang này</p>
        <el-button type="primary" @click="$router.push('/')">Về trang chủ</el-button>
    </div>
</template>

<script>
export default {
    name: 'Forbiddent',
}
</script>