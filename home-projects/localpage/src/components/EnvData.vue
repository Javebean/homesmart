<template>
  <div class="page">
    <a-radio-group v-model:value="activeKey" @change="tab1change">
      <a-radio-button value="JD_COOKIE">CK{{ enableCkNums }}</a-radio-button>
      <a-radio-button value="JD_WSCK">WSKEY{{ enableWsNums }}</a-radio-button>
      <a-radio-button value="ALL">其他</a-radio-button>
    </a-radio-group>

    <a-flex :justify="justify" :align="alignItems">
      <!-- <a-button @click="disableAllByType">禁用本页</a-button>
      <a-button @click="enableAllByType">启用本页</a-button> -->
      <a-button v-show="activeKey == 'JD_COOKIE' && ckCheckTaskId > 0"
        @click="startStopCrons(ckCheckTaskId)">ck检测</a-button>
      <a-button v-show="activeKey == 'JD_COOKIE' && ckCheckTaskId > 0"
        @click="getLatestTaskLog(ckCheckTaskId)">ck检测日志</a-button>
      <a-button v-show="activeKey != 'JD_COOKIE' && wsKeyTaskId > 0"
        @click="getLatestTaskLog(wsKeyTaskId)">wskey日志</a-button>

      <a-dropdown-button @click="showAddEnvTextare = !showAddEnvTextare">
        新建变量
        <template #overlay>
          <a-menu>
            <a-menu-item key="1" @click="disableAllByType">
              禁用本页
            </a-menu-item>
            <a-menu-item key="2" @click="enableAllByType">
              启用本页
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown-button>

    </a-flex>

    <div class="ws-log">
      {{ wslog }}
    </div>

    <a-card v-show="showAddEnvTextare" :bodyStyle="{ padding: '10px' }" style="width: 100%">
      <a-textarea v-model:value="newEnvValue" placeholder="请使用“空格” “,” “=” “#” 分隔键值对" />
      <a-flex :justify="justify" :align="alignItems">
        <a-button style="margin-top: 10px;" type="primary" @click="addNewEnv">保存</a-button>
      </a-flex>
    </a-card>
    <div class="data-item" v-for="env in items" :key="env.id">
      <a-card :bodyStyle="{ padding: '10px' }" style="width: 100%">
        <a-textarea :disabled="env.disabled" v-model:value="env.value"
          :placeholder="`请输入 ${env.remarks ? env.remarks + '的' + env.name : ''}`"
          :autoSize="env.value ? true : { minRows: 6, maxRows: 8 }" />

        <a-flex class="status-info" :justify="justify" :align="alignItems" wrap="wrap">
          <div>备注： {{ env.remarks ? env.remarks : '暂无' }}</div>
          <div>变量名：{{ env.name }}</div>
          <div>状态：<a-badge :color="env.status === 0 ? 'green' : 'red'" />{{ env.status === 0 ? "启用中" : "禁用中" }}</div>
          <div>时长：{{ getTimeDifference(env.timestamp) }} </div>
          <div>更新日期：{{ formatDateString(env.timestamp) }} </div>
        </a-flex>
        <a-flex :justify="justify" :align="alignItems">
          <a-button type="primary" @click="toggleQlEnvStatus(env.id)">{{ env.status === 0 ? "禁用" : "启用" }}</a-button>
          <!-- <a-button type="primary" v-show="env.name == 'JD_COOKIE'" @click="disableOtherCk(env.id)">禁用其他CK</a-button> -->
          <!-- <a-button type="primary" v-show="env.disabled" @click="editEnv(env.id)">更新</a-button> -->
          <!-- <a-button type="primary" :loading="env.loading" v-show="!env.disabled"
            @click="updateEnv(env.id)">保存</a-button> -->

          <a-dropdown-button>
            <span @click="editEnv(env.id)" v-show="env.disabled">更新</span>
            <span @click="updateEnv(env.id)" v-show="!env.disabled">保存</span>
            <template #overlay>
              <a-menu>
                <a-menu-item key="1" @click="env.disabled = false;">
                  编辑旧值
                </a-menu-item>
                <a-menu-item key="2" v-if="env.name == 'JD_COOKIE'" @click="disableOtherCk(env.id)">
                  禁用其他CK
                </a-menu-item>
                <a-menu-item key="3" @click="delEnv(env.id)">
                  删除
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown-button>

        </a-flex>
      </a-card>
    </div>
    <context-holder />
  </div>
</template>

<script lang="ts" setup>
import { ref, getCurrentInstance, onMounted, computed } from 'vue';
// import { MailOutlined, AppstoreOutlined, SettingOutlined } from '@ant-design/icons-vue';
import { DropdownButton as ADropdownButton, Menu as AMenu, MenuItem as AMenuItem, message, RadioButton as ARadioButton, RadioGroup as ARadioGroup, Flex as AFlex, Textarea as ATextarea, Button as AButton, Badge as ABadge, Card as ACard } from 'ant-design-vue';
// import { message, Flex as AFlex} from 'ant-design-vue';
//F1 -> reload window helped me
// import { MenuProps } from 'ant-design-vue';

// 新版message 需要在组件中引用<context-holder />才能生效
// https://juejin.cn/post/7358639538501419059
const [messageApi, contextHolder] = message.useMessage();

const successMsg = function (msg: string) {
  messageApi.success({
    content: () => msg,
    class: 'custom-class',
    style: {
      marginTop: '300px',
    },
  });
}
const warningMsg = function (msg: string) {
  messageApi.warning({
    content: () => msg,
    class: 'custom-class',
    style: {
      marginTop: '300px',
    },
  });
}
const errorMsg = function (msg: string) {
  messageApi.error({
    content: () => msg,
    class: 'custom-class',
    style: {
      marginTop: '300px',
    },
  });
}
const infoMsg = function (msg: string) {
  messageApi.info({
    content: () => msg,
    class: 'custom-class',
    style: {
      marginTop: '300px',
    },
  });
}

// ts proxy 使用
const { proxy }: any = getCurrentInstance()

const justify = "space-between";
const alignItems = "center";
// 初始tab值
const activeKey = ref('JD_COOKIE');
const wslog = ref('');
const newEnvValue = ref('');
const ckCheckTaskId = ref(0);
const wsKeyTaskId = ref(0);
const showAddEnvTextare = ref(false);

onMounted(() => {
  getInitInfo()
  getQlEnvsByName(activeKey.value)
})

// 定义一个 ref 来存储服务器返回的数据
const items = ref([]);
// 获取初始化数据
function getInitInfo() {
  proxy.$api.QL.getInitInfo({ type: name }).then((response: any) => {
    const data = response.data
    console.log(data);
    if (data.data && data.data.length > 0) {
      data.data.forEach((x: any) => {
        if (x.name.indexOf('检测') > -1) {
          ckCheckTaskId.value = x.id;
        } else if (x.name.indexOf('本地') > -1) {
          wsKeyTaskId.value = x.id;
        } else if (x.name.indexOf('转换') > -1) {
          wsKeyTaskId.value = x.id;
        }
      })
    }
  }).catch(function (error: any) {
    console.log(error);
  });
}

function getQlEnvsByName(name: string) {
  proxy.$api.QL.getQlEnvsByName({ type: name }).then((response: any) => {
    const data = response.data
    data.forEach((item: any) => {
      item.disabled = true;
      item.loading = false;
    });
    items.value = data;
  }).catch(function (error: any) {
    console.log(error);
  });
}

// 保存上一次的值
let temp = '';
const enableCkNums = computed(() => {
  console.log(activeKey.value);
  if (activeKey.value == 'JD_COOKIE') {
    const enabledCount = items.value.filter(o => o.status === 0).length;
    temp = `(${enabledCount}/${items.value.length})`
    return `(${enabledCount}/${items.value.length})`;
  } else {
    return temp;
  }
});

const enableWsNums = computed(() => {
  if (activeKey.value == 'JD_WSCK') {
    const enabledCount = items.value.filter(o => o.status === 0).length;
    temp = `(${enabledCount}/${items.value.length})`
    return `(${enabledCount}/${items.value.length})`;
  } else {
    return temp;
  }
});

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
function editEnv(id: number) {
  const itemToUpdate = items.value.find(item => item.id === id);
  itemToUpdate.value0 = itemToUpdate.value;
  itemToUpdate.value = "";
  itemToUpdate.disabled = false;
}

function addNewEnv() {
  let value = newEnvValue.value;
  const result = value.split(/[,\s#=]+/).filter(Boolean);;
  console.log('addNewEnv', result, result.length);
  if (result.length > 1) {
    proxy.$api.QL.addEnvs({ name: result[0], value: result[1], remarks: result[2] || '' }).then((response: any) => {
      console.log(response);
      successMsg(response.data.msg);
      showAddEnvTextare.value = false;
    }).catch(function (error: any) {
      console.log(error.response.data);
      errorMsg(error.response.data.msg)
    }).finally(() => {
      errorMsg('保存失败');
    })
  } else {
    warningMsg("变量格式不正确，请检查。")
  }
}

function delEnv(id: number) {
  proxy.$api.QL.delEnvs({ delIds: [id] }).then((response: any) => {
    const index = items.value.findIndex(item => item.id === id);
    if (index !== -1) {
      items.value.splice(index, 1);
    }
    successMsg(response.data.msg);
  }).catch(function (error: any) {
    console.log(error.response.data);
    errorMsg(error.response.data.msg)
  }).finally(() => {
    errorMsg('删除失败');
  })
}

//更新
function updateEnv(id: number) {
  const itemToUpdate = items.value.find(item => item.id === id);
  if (!itemToUpdate.value) {
    itemToUpdate.value = itemToUpdate.value0;
    infoMsg('无更新');
    window.scrollTo({ top: 0, behavior: 'auto' });
    itemToUpdate.disabled = true;
  } else {
    itemToUpdate.loading = true
    proxy.$api.QL.updateEnvById({ id: id, value: itemToUpdate.value }).then((response: any) => {
      const data = response.data
      itemToUpdate.value = data.value;
      if (data.status != -1) {
        itemToUpdate.status = data.status;
      }

      //把更新成功之后的移动到数组末尾
      const newArr = items.value.filter(item => item.id != id);
      newArr.push(itemToUpdate);
      items.value = newArr;
      console.log(data);
      successMsg(data.msg)
    }).catch(function (error: any) {
      console.log(error.response.data);
      errorMsg(error.response.data.msg)
    }).finally(() => {
      itemToUpdate.loading = false;
      itemToUpdate.disabled = true;
      window.scrollTo({ top: 0, behavior: 'auto' });
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
    successMsg('禁用成功')
  }).catch(function (error: any) {
    console.log(error);
  });
}

// --------------- 顶部菜单-----------------
// tab1 切换回调
function tab1change() {
  console.log(activeKey.value);
  getQlEnvsByName(activeKey.value);
  //清空log
  wslog.value = '';
}

// 禁用本页
function disableAllByType() {
  proxy.$api.QL.disableEnvByName({ name: activeKey.value }).then((response: any) => {
    items.value.forEach((item: any) => {
      item.status = 1;
    });
  }).catch(function (error: any) {
    console.log(error);
  });
}

// 启用本页
function enableAllByType() {
  proxy.$api.QL.enableEnvByName({ name: activeKey.value }).then((response: any) => {
    items.value.forEach((item: any) => {
      item.status = 0;
    });
  }).catch(function (error: any) {
    console.log(error);
  });
}

// 废弃 - 查看wskey最新日志
function selectLatestWsckLog() {
  proxy.$api.QL.getLatestWsckLog().then((response: any) => {
    console.log(response.data);
    wslog.value = response.data.logs;
  }).catch(function (error: any) {
    console.log(error);
  });
}

function getLatestTaskLog(id: number) {
  if (wslog.value) {
    wslog.value = '';
    return;
  }
  proxy.$api.QL.getLatestLogById({ id: id }).then((response: any) => {
    wslog.value = response.data.log;
  }).catch(function (error: any) {
    errorMsg('获取日志失败')
  }).finally(() => {
  });
}

function startStopCrons(id: number) {
  proxy.$api.QL.startStopCrons({ id: id }).then((response: any) => {
    const data = response.data
    successMsg(data.msg);
  }).catch(function (error: any) {
    console.log(error.response.data.msg);
    errorMsg(error.response.data.msg)
  }).finally(() => {
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

function getTimeDifference(dateString: string) {
  try {
    // 获取当前时间
    const now: Date = new Date();

    // 给定的时间
    const givenTimeStr: string = formatDateString(dateString);;
    const givenTime: Date = new Date(givenTimeStr.replace(' ', 'T'));

    // 计算时间差（毫秒）
    const timeDifference: number = now.getTime() - givenTime.getTime();

    // 计算相差的天数
    const daysDiff: number = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

    // 计算相差的小时数（去掉天数后的剩余部分）
    const hoursDiff: number = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    // 计算相差的分钟数（去掉天数和小时数后的剩余部分）
    const minutesDiff: number = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));

    // console.log(`与给定时间 "${givenTimeStr}" 相差: ${daysDiff} 天 ${hoursDiff} 小时 ${minutesDiff} 分钟`);

    return (daysDiff > 0 ? daysDiff + '天' : '') + (hoursDiff > 0 ? hoursDiff + '小时' : '') + ((minutesDiff || '0') + '分钟')

  } catch (error) {
    console.log(error);
    alert(`错误: ${error instanceof Error ? error.message : error}`);
  }

  // dateString = formatDateString(dateString);

  // // 将日期字符串转换为 Date 对象
  // const givenDate: Date = new Date(dateString);
  // const now: Date = new Date();

  // // 验证日期是否有效
  // if (isNaN(givenDate.getTime())) {
  //   throw new Error('Invalid date format');
  // }

  // // 计算时间差（以毫秒为单位）
  // const diffMillis: number = now.getTime() - givenDate.getTime();

  // // 将毫秒转换为分钟、小时和天数
  // const millisPerMinute: number = 1000 * 60;
  // const millisPerHour: number = millisPerMinute * 60;
  // const millisPerDay: number = millisPerHour * 24;

  // const minutes: number = diffMillis / millisPerMinute;
  // const hours: number = diffMillis / millisPerHour;
  // const days: number = Math.floor(hours / 24);
  // const remainingHours: number = Math.floor(hours % 24);
  // const remainingMinutes: number = Math.floor(minutes % 60);

  // // 返回格式化的时间差
  // if (minutes < 60) {
  //   return `${Math.floor(minutes)}分钟`;
  // } else if (hours < 24) {
  //   return `${Math.floor(hours)}小时${remainingMinutes}分钟`;
  // } else {
  //   return `${days}天${remainingHours}小时${remainingMinutes}分钟`;
  // }
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
  max-height: 300px;
  overflow-x: hidden;
  overflow-y: auto;
  margin-bottom: 10px;
  text-align: left;
  font-size: 12px;
}

.data-item {
  margin: 0.8rem 0;
}

.status-info {
  font-size: 1rem;
  margin: 0.5rem 0;
}
</style>
