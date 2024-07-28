<template>
  <div class="container">
    <a-radio-group size="small" v-model:value="activeKey" @change="tab1change">
      <a-radio-button v-for="tab in tabViews" :value="tab.id">{{ tab.name }}({{ getTabCronNums(tab.id)
        }})</a-radio-button>
    </a-radio-group>
    <a-radio-group size="small" v-model:value="activeKey" @change="tab2change">
      <a-radio-button value="top">置顶({{ getTabCronNums("top") }})</a-radio-button>
      <a-radio-button value="today">今日({{ getTabCronNums("today") }})</a-radio-button>
      <a-radio-button value="todayOnce">已完成({{ getTabCronNums("todayOnce") }})</a-radio-button>
      <a-radio-button value="future">下次运行({{ getTabCronNums("future") }})</a-radio-button>
      <!-- 
      <a-radio-button value="nongchang">农场</a-radio-button>
      <a-radio-button value="dapai">大牌</a-radio-button>
      <a-radio-button value="all">全部</a-radio-button> -->
    </a-radio-group>
    <div v-show="dataLoading">
      <a-spin />
    </div>
    <div v-show="!dataLoading" v-for="da in dataList" :key="da.id">
      <a-card class="card-item" :bodyStyle="{ padding: '10px' }"
        :title="da.name + ' ' + formatTimestamp(da.last_execution_time) + isToday(da.last_execution_time)">
        <div>corn: {{ da.schedule }} {{ formatHHMM(da.nextExeTime) }}</div>
        <div class="task-log">
          {{ da.log }}
        </div>
        <a-flex :justify="justify" :align="alignItems">
          <a-button type="primary" @click=getLatestTaskLog(da.id)>刷新日志</a-button>
          <a-button type="primary" @click="enOrDisableCrons(da.id)">{{ da.isDisabled == 1 ? '启用' : '禁用' }}</a-button>
          <!-- 1空闲 0运行中 -->
          <a-button type="primary" @click="startStopCrons(da.id)">{{ da.status == 1 ? '运行' : '停止' }}</a-button>
        </a-flex>
      </a-card>
    </div>
  </div>
  <context-holder />
</template>

<script lang="ts" setup>
import { message, Spin as ASpin, Card as ACard, Button as AButton, Flex as AFlex, RadioButton as ARadioButton, RadioGroup as ARadioGroup } from 'ant-design-vue';
import { ref, getCurrentInstance, onMounted } from 'vue';
const { proxy }: any = getCurrentInstance()

// 新版message 需要在组件中引用<context-holder />才能生效
// https://juejin.cn/post/7358639538501419059
const [messageApi, contextHolder] = message.useMessage();
const justify = "space-between";
const alignItems = "center";

onMounted(() => {
  getCronsViews();
})

// 定义一个 ref 来存储服务器返回的数据
const dataList = ref([]);
const todayCount = ref(0);
const todayOnceCount = ref(0);
const dataLoading = ref(true);
const noLogTaskIds = ref([]);
const tabViews = ref([]);
const tabViewNums = ref([]);
const activeKey = ref('');
// const activeKey2 = ref('');

//青龙原生tab视图
function getCornTaskAndLog(tab: any) {
  dataLoading.value = true;
  proxy.$api.QL.getCornTaskAndLog(tab).then((response: any) => {
    const data = response.data
    // console.log(data);
    dataList.value = data;


    // 显示每个tab的数量
    let tabNums = { 'tabKey': tab.id + '_num', 'tabNums': data.length };
    tabViewNums.value.push(tabNums);

    // 收集没有log的任务id
    noLogTaskIds.value = data.filter((e: any) => !e.log).map((e: any) => e.id);
    console.log(noLogTaskIds.value.length + "条任务无日志");
    getSubArrays(6, activeKey.value.toString())
  }).catch(function (error: any) {
    console.log(error);
  }).finally(() => {
    dataLoading.value = false;
  });
}

//自定义视图
function getCornTaskAndLog2(name: string) {
  dataLoading.value = true;
  proxy.$api.QL.getCornTaskAndLog2({ type: name }).then((response: any) => {
    const data = response.data
    // console.log(data);
    dataList.value = data;

    // 显示每个tab的数量
    let tabNums = { 'tabKey': name + '_num', 'tabNums': data.length };
    tabViewNums.value.push(tabNums);

    // 收集没有log的任务id
    noLogTaskIds.value = data.filter((e: any) => !e.log).map((e: any) => e.id);
    console.log(noLogTaskIds.value.length + "条任务无日志");
    getSubArrays(6, activeKey.value.toString())
  }).catch(function (error: any) {
    console.log(error);
  }).finally(() => {
    dataLoading.value = false;
  });
}

//一次抓取m条日志
async function getSubArrays(m: number, type: string) {
  const n = noLogTaskIds.value.length;
  if (noLogTaskIds.value.length > 0) {
    for (let i = 0; i < n; i += m) {
      let childArr = noLogTaskIds.value.slice(i, i + m);
      if (childArr.length > 0 && type == activeKey.value) {
        console.log('--', childArr, type, activeKey.value);
        getTaskLogsByIds(childArr)
        await waitTime(1000);
      }
    }
  }
}

const waitTime = (WAIT_TIME: number) => {
  return new Promise(resolve => {
    setTimeout(resolve, WAIT_TIME)
  });
}

// 根据ids得到日志
function getTaskLogsByIds(ids: any) {
  proxy.$api.QL.getTaskLogsByIds({ ids }).then((response: any) => {
    let logsArr = response.data.result;
    for (let i = 0; i < logsArr.length; i++) {
      let id = logsArr[i].id;
      let task = dataList.value.find(e => e.id == id);

      task.log = logsArr[i].log;
      // console.log(task.log);
    }
  }).catch(function (error: any) {
    console.log(error);
  }).finally(() => {
  });
}

function startStopCrons(id: number) {
  proxy.$api.QL.startStopCrons({ id: id }).then((response: any) => {
    const data = response.data
    let task = dataList.value.find(e => e.id == id);
    task.status = data.status;
    messageApi.success({
      content: () => data.msg,
      class: 'custom-class',
      style: {
        marginTop: '300px',
      },
    });
  }).catch(function (error: any) {
    console.log(error.response.data.msg);
    messageApi.error({
      content: () => error.response.data.msg,
      class: 'custom-class',
      style: {
        marginTop: '300px',
      },
    });
  }).finally(() => {
  });
}

function enOrDisableCrons(id: number) {
  proxy.$api.QL.enOrDisableCrons({ id: id }).then((response: any) => {
    const data = response.data
    let task = dataList.value.find(e => e.id == id);
    task.isDisabled = data.isDisabled;
    messageApi.success({
      content: () => data.msg,
      class: 'custom-class',
      style: {
        marginTop: '300px',
      },
    });
  }).catch(function (error: any) {
    console.log(error.response.data.msg);
    messageApi.error({
      content: () => error.response.data.msg,
      class: 'custom-class',
      style: {
        marginTop: '300px',
      },
    });
  }).finally(() => {
  });
}

function getLatestTaskLog(id: number) {
  proxy.$api.QL.getLatestLogById({ id: id }).then((response: any) => {
    const data = response.data
    // console.log(response.data);
    let task = dataList.value.find(e => e.id == id);
    task.log = response.data.log;
    messageApi.success({
      content: () => '刷新成功',
      class: 'custom-class',
      style: {
        marginTop: '300px',
      },
    });
  }).catch(function (error: any) {
    // console.log(error.response.data.msg);
    messageApi.error({
      content: () => '获取日志失败',
      class: 'custom-class',
      style: {
        marginTop: '300px',
      },
    });
  }).finally(() => {
  });
}

function getCronsViews() {
  proxy.$api.QL.getCronsViews().then((response: any) => {
    const data = response.data
    console.log(response.data);
    tabViews.value = response.data;
    activeKey.value = response.data[0].id;
    getCornTaskAndLog(response.data[0])
  }).catch(function (error: any) {

  }).finally(() => {
  });
}

function getTabCronNums(tabName: any) {
  let tab = tabViewNums.value.find(x => x.tabKey == tabName + '_num');
  return tab ? tab.tabNums : 0;
}

// --------------- 顶部菜单-----------------
// tab1 切换回调
function tab1change() {
  let curTab = tabViews.value.find(x => x.id == activeKey.value)
  // console.log(curTab,activeKey.value);
  //获取任务和日志
  getCornTaskAndLog(curTab);
}
function tab2change() {
  console.log(activeKey.value);
  getCornTaskAndLog2(activeKey.value);
}

function formatTimestamp(timestamp: number) {
  // 将时间戳转换为毫秒
  const date = new Date(timestamp * 1000);

  // 格式化日期为 YYYY-MM-DD HH:MM:SS
  // const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  // const seconds = String(date.getSeconds()).padStart(2, '0');

  const formattedDate = `${month}-${day} ${hours}:${minutes}`;
  // 返回结果对象
  return formattedDate;
}
function formatHHMM(timestamp: number) {
  if (!timestamp) {
    return '';
  }
  // 将时间戳转换为毫秒
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `，下次执行：${hours}:${minutes}`;
}

function isToday(timestamp: number) {
  // 将时间戳转换为毫秒
  const date = new Date(timestamp * 1000);

  // 格式化日期为 YYYY-MM-DD HH:MM:SS
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  // 获取当前日期
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDay = today.getDate();

  if (year == todayYear && month == todayMonth) {
    let diffDay = todayDay - day;
    if (diffDay == 0) {
      return '【今天】'
    } else if (diffDay == 1) {
      return '【昨天】'
    } else if (diffDay == 2) {
      return '【前天】'
    } else if (diffDay < 10) {
      return '【' + diffDay + '天前】'
    }
  }
  return '';
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.container {
  width: 92%;
  margin: 0 auto;
}

.card-item {
  margin-bottom: 20px;
}

.task-log {
  max-height: 300px;
  overflow-x: hidden;
  overflow-y: auto;
  white-space: pre-wrap;
  margin-bottom: 10px;
  text-align: left;
  font-size: 12px;
}
</style>
