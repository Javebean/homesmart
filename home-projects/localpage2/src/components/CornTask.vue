<template>
  <div class="hello" v-for="da in dataList" :key="da.id">
    <a-card :title="da.name">
      {{ da.log }}
    </a-card>
  </div>
</template>

<script lang="ts" setup>
import { Card as ACard } from 'ant-design-vue';
import { ref, getCurrentInstance, onMounted } from 'vue';
const { proxy }: any = getCurrentInstance()


onMounted(() => {
  getCornTaskAndLog('nongchang')
})

// 定义一个 ref 来存储服务器返回的数据
const dataList = ref([]);

function getCornTaskAndLog(name: string) {
  proxy.$api.QL.getCornTaskAndLog({ type: name }).then((response: any) => {
    const data = response.data
    // console.log(data);
    dataList.value = data;
  }).catch(function (error: any) {
    console.log(error);
  });
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
