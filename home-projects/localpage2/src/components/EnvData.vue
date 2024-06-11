<template>
  <div class="page">
    <a-radio-group v-model:value="activeKey" @change="tab1change">
      <a-radio-button value="JD_COOKIE">CK({{ enableCkNums }})</a-radio-button>
      <a-radio-button value="JD_WSCK">WSKEY（{{enableWsNums}}）</a-radio-button>
      <a-radio-button value="ALL">其他</a-radio-button>
    </a-radio-group>

    <a-flex :justify="justify" :align="alignItems" wrap="wrap">
      <a-button @click="disableAllByType">禁用本页</a-button>
      <a-button @click="enableAllByType">启用本页</a-button>
      <a-button @click="selectLatestWsckLog">查看最新wskey日志</a-button>
    </a-flex>

    <div class="ws-log">
      {{ wslog }}
    </div>

    <div class="data-item" v-for="env in items" :key="env.id">
      <a-card :bodyStyle="{ padding: '10px' }" style="width: 100%">
        <a-textarea :disabled="env.disabled" v-model:value="env.value"
          :placeholder="`请输入 ${env.remarks ? env.remarks + '的' + env.name : ''}`"
          :autoSize="env.value ? true : { minRows: 6, maxRows: 8 }" />

        <a-flex class="status-info" :justify="justify" :align="alignItems" wrap="wrap">
          <div>备注： {{ env.remarks }}</div>
          <div>变量名：{{ env.name }}</div>
          <div>状态：<a-badge :color="env.status === 0 ? 'green' : 'red'" />{{ env.status === 0 ? "启用中" : "禁用中" }}</div>
          <div>更新日期：{{ formatDateString(env.timestamp) }}</div>
        </a-flex>
        <a-flex :justify="justify" :align="alignItems">
          <a-button type="primary" @click="toggleQlEnvStatus(env.id)">{{ env.status === 0 ? "禁用" : "启用" }}</a-button>
          <a-button type="primary" v-show="env.name == 'JD_COOKIE'" @click="disableOtherCk(env.id)">禁用其他CK</a-button>
          <a-button type="primary" v-show="env.disabled" @click="updateQlEnv(env.id)">编辑</a-button>
          <a-button type="primary" :loading="env.loading" v-show="!env.disabled"
            @click="saveQlEnv(env.id)">保存</a-button>
        </a-flex>
      </a-card>
    </div>
    <context-holder />
  </div>
</template>

<script lang="ts" setup>
import { ref, getCurrentInstance, onMounted } from 'vue';
// import { MailOutlined, AppstoreOutlined, SettingOutlined } from '@ant-design/icons-vue';
import { message, RadioButton as ARadioButton, RadioGroup as ARadioGroup, Flex as AFlex, Textarea as ATextarea, Button as AButton, Badge as ABadge, Card as ACard } from 'ant-design-vue';
// import { message, Flex as AFlex} from 'ant-design-vue';
//F1 -> reload window helped me
// import { MenuProps } from 'ant-design-vue';

// 新版message 需要在组件中引用<context-holder />才能生效
// https://juejin.cn/post/7358639538501419059
const [messageApi, contextHolder] = message.useMessage();

// ts proxy 使用
const { proxy }: any = getCurrentInstance()

const justify = "space-between";
const alignItems = "center";
// 初始tab值
const activeKey = ref('JD_COOKIE');
const enableCkNums = ref(0);
const enableWsNums = ref(0);
const wslog = ref('');

onMounted(() => {
  getQlEnvsByName(activeKey.value)
})

// 定义一个 ref 来存储服务器返回的数据
const items = ref([]);
// 根据名称获取环境变量
function getQlEnvsByName(name: string) {
  proxy.$api.QL.getQlEnvsByName({ type: name }).then((response: any) => {
    const data = response.data
    data.forEach((item: any) => {
      item.disabled = true;
      item.loading = false;
    });
    if(name == 'JD_COOKIE'){
      enableCkNums.value = data.filter((item: any) => item.status == 0).length;
      } else if (name == "JD_WSCK"){
        enableWsNums.value = data.filter((item: any) => item.status == 0).length;
    }
    items.value = data;
  }).catch(function (error: any) {
    console.log(error);
  });
}

// 启用禁用切换按钮
function toggleQlEnvStatus(id: number) {
  proxy.$api.QL.toggleQlEnvStatus({ id }).then((response: any) => {
    const data = response.data
    const itemToUpdate = items.value.find(item => item.id === data.id);
    if (itemToUpdate) {
      itemToUpdate.status = data.status;
    }
  }).catch(function (error: any) {
    console.log(error);
  });
}

// 编辑
function updateQlEnv(id: number) {
  const itemToUpdate = items.value.find(item => item.id === id);
  itemToUpdate.value0 = itemToUpdate.value;
  itemToUpdate.value = "";
  itemToUpdate.disabled = false;
}

//保存
function saveQlEnv(id: number) {
  const itemToUpdate = items.value.find(item => item.id === id);
  if (!itemToUpdate.value) {
    itemToUpdate.value = itemToUpdate.value0;
    // message.info('无更新');
    messageApi.info({
      content: () => '无更新',
      class: 'custom-class',
      style: {
        marginTop: '5vh',
      },
    });

    itemToUpdate.disabled = true;
  } else {
    itemToUpdate.loading = true
    proxy.$api.QL.updateEnvById({ id: id, value: itemToUpdate.value }).then((response: any) => {
      const data = response.data
      itemToUpdate.value = data.value;
      itemToUpdate.status = data.status;
      console.log(data);
      messageApi.success({
        content: () => data.msg,
        class: 'custom-class',
        style: {
          marginTop: '5vh',
        },
      });
    }).catch(function (error: any) {
      console.log(error.response.data);
      messageApi.error({
        content: () => error.response.data.msg,
        class: 'custom-class',
        style: {
          marginTop: '5vh',
        },
      });
    }).finally(() => {
      itemToUpdate.loading = false;
      itemToUpdate.disabled = true;
    });
  }
}

//禁用其他ck
function disableOtherCk(id: number) {
  proxy.$api.QL.disableOtherCK({ id: id }).then((response: any) => {
    // const data = response.data
    items.value.forEach((item: any) => {
      if (item.id == id) {
        item.status = 0;
      } else {
        item.status = 1;
      }
    });
    // message.success('禁用成功');
    messageApi.success({
      content: () => '禁用成功',
      class: 'custom-class',
      style: {
        marginTop: '5vh',
      },
    });
  }).catch(function (error: any) {
    console.log(error);
  });
}

// --------------- 顶部菜单-----------------
// tab1 切换回调
function tab1change() {
  console.log(activeKey.value);
  getQlEnvsByName(activeKey.value);
}

// 启用本页
function disableAllByType() {
  proxy.$api.QL.disableEnvByName({ name: activeKey.value }).then((response: any) => {
    items.value.forEach((item: any) => {
      item.status = 1;
    });
  }).catch(function (error: any) {
    console.log(error);
  });
}

// 禁用本页
function enableAllByType() {
  proxy.$api.QL.enableEnvByName({ name: activeKey.value }).then((response: any) => {
    items.value.forEach((item: any) => {
      item.status = 0;
    });
  }).catch(function (error: any) {
    console.log(error);
  });
}

// 查看wskey最新日志
function selectLatestWsckLog() {
  proxy.$api.QL.getLatestWsckLog().then((response: any) => {
    console.log(response.data);
    wslog.value = response.data.logs;
  }).catch(function (error: any) {
    console.log(error);
  });
}

//utils
function formatDateString(dateString: string) {
  // 将日期字符串拆分为数组
  const dateParts = dateString.split(' ');
  // 月份映射
  const monthMap = {
    Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
    Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
  };

  // 提取年、月、日和时间部分
  const day = dateParts[2];
  const month = monthMap[dateParts[1]];
  const year = dateParts[3];
  const time = dateParts[4];

  // 格式化日期为 YYYY-MM-DD HH:mm:ss
  const formattedDate = `${year}-${month}-${day} ${time}`;
  return formattedDate;
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.page {
  padding: 1rem 1rem;

}

.ws-log {
  white-space: pre-wrap;
  text-align: left;
}

.data-item {
  margin: 0.8rem 0;
}

.status-info {
  font-size: 1rem;
  margin: 0.5rem 0;
}
</style>
