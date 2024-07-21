<template>
  <a-button type="primary" @click="backupEnv">新增备份</a-button>
  <div v-for="item in backupList" :key="item">
    <a-card :title="item" style="width: 96%">
      <template #extra><a href="#">more</a></template>
      <p>备份成功</p>
    </a-card>
  </div>
  <context-holder />
</template>
<script lang="ts" setup>
import { SmileOutlined, DownOutlined } from '@ant-design/icons-vue';
import { message, Divider as ADivider, Button as AButton, Card as ACard, Textarea as ATextarea } from 'ant-design-vue';
import { ref, getCurrentInstance, onMounted } from 'vue';
const [messageApi, contextHolder] = message.useMessage();
const { proxy }: any = getCurrentInstance()


const backupList = ref([]);

onMounted(() => {
  getBackupEnvList();
})
const tableData = ref([]);

function backupEnv() {
  proxy.$api.QL.backupEnv().then((response: any) => {
    const data = response.data
    if (data.status == 0) {
      backupList.value.unshift(data.filename);
      messageApi.success({
        content: () => "备份成功",
        class: 'custom-class',
        style: {
          marginTop: '100px',
        },
      });
    }

  }).catch(function (error: any) {
    console.log(error);
    messageApi.error({
      content: () => '备份失败',
      class: 'custom-class',
      style: {
        marginTop: '300px',
      },
    });
  }).finally(() => {
  });
}


function getBackupEnvList() {
  proxy.$api.QL.getBackupEnvList().then((response: any) => {
    const data = response.data
    if (data.code == 0) {
      backupList.value = data.data;
      if (data.data && data.data.length > 0) {
        messageApi.success({
          content: () => '加载备份记录成功',
          class: 'custom-class',
          style: {
            marginTop: '300px',
          },
        });
      }
    }
  }).catch(function (error: any) {
    console.log(error);
    messageApi.error({
      content: () => "加载备份记录失败",
      class: 'custom-class',
      style: {
        marginTop: '300px',
      },
    });
  }).finally(() => {
  });
}

function specifiedWskeyToCk(id: number, wskey: string) {
  let task = tableData.value.find(e => e.id == id);
  task.parsing = true;
  proxy.$api.QL.specifiedWskeyToCk({ wskey: wskey, parseWsck: 'parseWsck' }).then((response: any) => {
    const data = response.data
    task.parseCk = JSON.stringify(data.data);
    messageApi.success({
      content: () => "转换成功",
      class: 'custom-class',
      style: {
        marginTop: '300px',
      },
    });
  }).catch(function (error: any) {
    console.log(error);
    messageApi.error({
      content: () => error.response.data.msg,
      class: 'custom-class',
      style: {
        marginTop: '300px',
      },
    });
  }).finally(() => {
    task.parsing = false;
  });
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.td {
  word-break: break-all;
}
</style>