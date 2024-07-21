<template>

  <a-textarea v-model:value="text" placeholder="粘贴文本" :rows="4" />
  <a-button @click="parseWsck">解析wskey</a-button>

  <a-table  :scroll="{ x: 0, y: 10000 }" style="width: 100%;" :columns="columns" :data-source="tableData">


    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'value'">
          <div > {{ record.value }}</div>
      </template>
      <template v-else-if="column.key === 'action'">
        <span>
          <a-button size="small" type="primary" @click="specifiedWskeyToCk(record.id, record.name)"
            :loading="record.parsing">解析</a-button>
          <!-- <a-divider type="vertical" />
          <a-button type="primary" @click="startStopCrons(record.id)" :loading="record.parsing">解析2</a-button> -->
        </span>
      </template>
    </template>
  </a-table>
  <context-holder />
</template>
<script lang="ts" setup>
import { SmileOutlined, DownOutlined } from '@ant-design/icons-vue';
import { message, Divider as ADivider, Button as AButton, Table as ATable, Textarea as ATextarea } from 'ant-design-vue';
import { ref, getCurrentInstance, onMounted } from 'vue';
const [messageApi, contextHolder] = message.useMessage();
const { proxy }: any = getCurrentInstance()


const text = ref<string>('');
const columns = [
  {
    title: '序号',
    dataIndex: 'id',
    key: 'id',
    width:"10%"
  },
  {
    title: 'wskey值',
    dataIndex: 'value',
    key: 'value',
    width:"40%"
  },
  {
    title: '解析完成',
    dataIndex: 'parseCk',
    key: 'parseCk',
    width:"40%"
  },
  {
    title: '操作',
    key: 'action',
    width:"10%"
  },
];

onMounted(() => {
  getQlEnvsByName('JD_WSCK');
})
const tableData = ref([]);

function parseWsck() {
  proxy.$api.QL.parseWsck({ text: text.value, name: 'parseWsck', remarks: "wskey数组1" }).then((response: any) => {
    const data = response.data
    tableData.value = data.data;
    // console.log(data.data);
    messageApi.success({
      content: () => "解析成功",
      class: 'custom-class',
      style: {
        marginTop: '100px',
      },
    });
  }).catch(function (error: any) {
    console.log(error);
    messageApi.error({
      content: () => '解析失败',
      class: 'custom-class',
      style: {
        marginTop: '300px',
      },
    });
  }).finally(() => {
  });
}


function getQlEnvsByName(name: string) {
  proxy.$api.QL.getQlEnvsByName({ type: name }).then((response: any) => {
    const data = response.data
    // task.parsing = false;

    tableData.value = JSON.parse(data[0].value);
    console.log(tableData.value);
    messageApi.success({
      content: () => '获取上次记录成功',
      class: 'custom-class',
      style: {
        marginTop: '300px',
      },
    });
  }).catch(function (error: any) {
    messageApi.error({
      content: () => "解析失败",
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
      content: () => "转换失败",
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