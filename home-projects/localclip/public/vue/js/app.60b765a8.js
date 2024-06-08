(function(){"use strict";var e={7996:function(e,t,n){var a={};n.r(a),n.d(a,{disableEnvByName:function(){return z},disableOtherCK:function(){return U},enableEnvByName:function(){return H},getLatestWsckLog:function(){return V},getQlEnvsByName:function(){return D},toggleQlEnvStatus:function(){return X},updateEnvById:function(){return G}});var o=n(2938),u=n(1011);function r(e,t){const n=(0,u.g2)("router-link"),a=(0,u.g2)("router-view");return(0,u.uX)(),(0,u.CE)(u.FK,null,[(0,u.Lk)("nav",null,[(0,u.bF)(n,{to:"/env"},{default:(0,u.k6)((()=>[(0,u.eW)("Home")])),_:1}),(0,u.eW)(" | "),(0,u.bF)(n,{to:"/about"},{default:(0,u.k6)((()=>[(0,u.eW)("About")])),_:1})]),(0,u.bF)(a)],64)}var i=n(6633);const l={},c=(0,i.A)(l,[["render",r]]);var s=c,d=n(4545),f=n(4739),v=n(5738),p=n(3386),b=n(7156),g=n(3470),h=n(7364),m=n(5628),y=n(7116),k=n(8329),_=n(9052);const E=e=>((0,u.Qi)("data-v-c5e2eb0a"),e=e(),(0,u.jt)(),e),A={class:"page"},C=E((()=>(0,u.Lk)("span",null," WSKEY ",-1))),L=E((()=>(0,u.Lk)("span",null," CK ",-1))),O=E((()=>(0,u.Lk)("span",null," ALL ",-1))),F={class:"ws-log"},w="space-between",R="center";var S=(0,u.pM)({__name:"EnvData",setup(e){const{proxy:t}=(0,u.nI)(),n=(0,f.KR)("JD_WSCK"),a=(0,f.KR)("");(0,u.sV)((()=>{i(n.value)}));const r=(0,f.KR)([]);function i(e){t.$api.QL.getQlEnvsByName({type:e}).then((e=>{const t=e.data;t.forEach((e=>{e.disabled=!0,e.loading=!1})),r.value=t})).catch((function(e){console.log(e)}))}function l(e){t.$api.QL.toggleQlEnvStatus({id:e}).then((e=>{const t=e.data,n=r.value.find((e=>e.id===t.id));n&&(n.status=t.status)})).catch((function(e){console.log(e)}))}function c(e){const t=r.value.find((t=>t.id===e));t.value0=t.value,t.value="",t.disabled=!1}function s(e){const n=r.value.find((t=>t.id===e));n.value?(n.loading=!0,t.$api.QL.updateEnvById({id:e,value:n.value}).then((e=>{const t=e.data;n.value=t.value,console.log(t),n.loading=!1,n.disabled=!0,p.Ay.success("更新成功")})).catch((function(e){console.log(e)}))):(n.value=n.value0,p.Ay.info("无更新"),n.disabled=!0)}function d(e){t.$api.QL.disableOtherCK({id:e}).then((t=>{r.value.forEach((t=>{t.id==e?t.status=0:t.status=1})),p.Ay.success("禁用成功")})).catch((function(e){console.log(e)}))}function E(e){i(e)}function S(){t.$api.QL.disableEnvByName({name:n.value}).then((e=>{r.value.forEach((e=>{e.status=1}))})).catch((function(e){console.log(e)}))}function W(){t.$api.QL.enableEnvByName({name:n.value}).then((e=>{r.value.forEach((e=>{e.status=0}))})).catch((function(e){console.log(e)}))}function j(){t.$api.QL.getLatestWsckLog().then((e=>{console.log(e.data),a.value=e.data.logs})).catch((function(e){console.log(e)}))}function K(e){const t=e.split(" "),n={Jan:"01",Feb:"02",Mar:"03",Apr:"04",May:"05",Jun:"06",Jul:"07",Aug:"08",Sep:"09",Oct:"10",Nov:"11",Dec:"12"},a=t[2],o=n[t[1]],u=t[3],r=t[4],i=`${u}-${o}-${a} ${r}`;return i}return(e,t)=>((0,u.uX)(),(0,u.CE)("div",A,[(0,u.bF)((0,f.R1)(b.A),{size:"large",centered:!0,activeKey:n.value,"onUpdate:activeKey":t[0]||(t[0]=e=>n.value=e),onChange:E},{default:(0,u.k6)((()=>[(0,u.bF)((0,f.R1)(g.A),{key:"JD_WSCK"},{tab:(0,u.k6)((()=>[C])),_:1}),(0,u.bF)((0,f.R1)(g.A),{key:"JD_COOKIE"},{tab:(0,u.k6)((()=>[L])),_:1}),(0,u.bF)((0,f.R1)(g.A),{key:"ALL"},{tab:(0,u.k6)((()=>[O])),_:1})])),_:1},8,["activeKey"]),(0,u.bF)((0,f.R1)(h.A),{justify:w,align:R,wrap:"wrap"},{default:(0,u.k6)((()=>[(0,u.bF)((0,f.R1)(m.A),{onClick:S},{default:(0,u.k6)((()=>[(0,u.eW)("禁用本页")])),_:1}),(0,u.bF)((0,f.R1)(m.A),{onClick:W},{default:(0,u.k6)((()=>[(0,u.eW)("启用本页")])),_:1}),(0,u.bF)((0,f.R1)(m.A),{onClick:j},{default:(0,u.k6)((()=>[(0,u.eW)("查看wskey日志")])),_:1})])),_:1}),(0,u.Lk)("div",F,(0,v.v_)(a.value),1),((0,u.uX)(!0),(0,u.CE)(u.FK,null,(0,u.pI)(r.value,(e=>((0,u.uX)(),(0,u.CE)("div",{class:"data-item",key:e.id},[(0,u.bF)((0,f.R1)(y.Ay),{bodyStyle:{padding:"10px"},style:{width:"100%"}},{default:(0,u.k6)((()=>[(0,u.bF)((0,f.R1)(k.A),{disabled:e.disabled,value:e.value,"onUpdate:value":t=>e.value=t,placeholder:"请输入新值",autosize:!0},null,8,["disabled","value","onUpdate:value"]),(0,u.bF)((0,f.R1)(h.A),{class:"status-info",justify:w,align:R,wrap:"wrap"},{default:(0,u.k6)((()=>[(0,u.Lk)("div",null,"备注： "+(0,v.v_)(e.remarks),1),(0,u.Lk)("div",null,"变量名："+(0,v.v_)(e.name),1),(0,u.Lk)("div",null,[(0,u.eW)("状态："),(0,u.bF)((0,f.R1)(_.A),{color:0===e.status?"green":"red"},null,8,["color"]),(0,u.eW)((0,v.v_)(0===e.status?"启用中":"禁用中"),1)]),(0,u.Lk)("div",null,"更新日期："+(0,v.v_)(K(e.timestamp)),1)])),_:2},1024),(0,u.bF)((0,f.R1)(h.A),{justify:w,align:R},{default:(0,u.k6)((()=>[(0,u.bF)((0,f.R1)(m.A),{type:"primary",onClick:t=>l(e.id)},{default:(0,u.k6)((()=>[(0,u.eW)((0,v.v_)(0===e.status?"禁用":"启用"),1)])),_:2},1032,["onClick"]),(0,u.bo)((0,u.bF)((0,f.R1)(m.A),{type:"primary",onClick:t=>d(e.id)},{default:(0,u.k6)((()=>[(0,u.eW)("禁用其他CK")])),_:2},1032,["onClick"]),[[o.aG,"JD_COOKIE"==e.name]]),(0,u.bo)((0,u.bF)((0,f.R1)(m.A),{type:"primary",onClick:t=>c(e.id)},{default:(0,u.k6)((()=>[(0,u.eW)("编辑")])),_:2},1032,["onClick"]),[[o.aG,e.disabled]]),(0,u.bo)((0,u.bF)((0,f.R1)(m.A),{type:"primary",loading:e.loading,onClick:t=>s(e.id)},{default:(0,u.k6)((()=>[(0,u.eW)("保存")])),_:2},1032,["loading","onClick"]),[[o.aG,!e.disabled]])])),_:2},1024)])),_:2},1024)])))),128))]))}});const W=(0,i.A)(S,[["__scopeId","data-v-c5e2eb0a"]]);var j=W;const K={class:"home"};var T=(0,u.pM)({__name:"HomeView",setup(e){return(e,t)=>((0,u.uX)(),(0,u.CE)("div",K,[(0,u.bF)(j)]))}});const P=T;var Q=P;const $=[{path:"/env",name:"home",component:Q},{path:"/about",name:"about",component:()=>n.e(594).then(n.bind(n,4457))}],B=(0,d.aE)({history:(0,d.LA)("/v/"),routes:$});var N=B,q=n(7902),I=(0,q.y$)({state:{},getters:{},mutations:{},actions:{},modules:{}}),x=n(8114);const J=x.A.create({baseURL:"/"});J.defaults.headers.post["Content-Type"]="application/json";var M=J;function D(e={}){return M({method:"POST",url:"/ql/getTypeEnv",data:e})}function X(e={}){return M({method:"POST",url:"/ql/toggleStatus",data:e})}function G(e={}){return M({method:"POST",url:"/ql/updateEnvById",data:e})}function U(e={}){return M({method:"POST",url:"/ql/disableOtherCk",data:e})}function z(e={}){return M({method:"POST",url:"/ql/disableEnvByName",data:e})}function H(e={}){return M({method:"POST",url:"/ql/enableEnvByName",data:e})}function V(){return M({method:"GET",url:"/ql/getLatestWsckLog"})}var Y={QL:a};n(6505);const Z=(0,o.Ef)(s);Z.config.globalProperties.$api=Y,Z.use(I).use(N).mount("#app")}},t={};function n(a){var o=t[a];if(void 0!==o)return o.exports;var u=t[a]={exports:{}};return e[a].call(u.exports,u,u.exports,n),u.exports}n.m=e,function(){var e=[];n.O=function(t,a,o,u){if(!a){var r=1/0;for(s=0;s<e.length;s++){a=e[s][0],o=e[s][1],u=e[s][2];for(var i=!0,l=0;l<a.length;l++)(!1&u||r>=u)&&Object.keys(n.O).every((function(e){return n.O[e](a[l])}))?a.splice(l--,1):(i=!1,u<r&&(r=u));if(i){e.splice(s--,1);var c=o();void 0!==c&&(t=c)}}return t}u=u||0;for(var s=e.length;s>0&&e[s-1][2]>u;s--)e[s]=e[s-1];e[s]=[a,o,u]}}(),function(){n.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return n.d(t,{a:t}),t}}(),function(){n.d=function(e,t){for(var a in t)n.o(t,a)&&!n.o(e,a)&&Object.defineProperty(e,a,{enumerable:!0,get:t[a]})}}(),function(){n.f={},n.e=function(e){return Promise.all(Object.keys(n.f).reduce((function(t,a){return n.f[a](e,t),t}),[]))}}(),function(){n.u=function(e){return"js/about.aba46e19.js"}}(),function(){n.miniCssF=function(e){}}(),function(){n.g=function(){if("object"===typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"===typeof window)return window}}()}(),function(){n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)}}(),function(){var e={},t="localpage2:";n.l=function(a,o,u,r){if(e[a])e[a].push(o);else{var i,l;if(void 0!==u)for(var c=document.getElementsByTagName("script"),s=0;s<c.length;s++){var d=c[s];if(d.getAttribute("src")==a||d.getAttribute("data-webpack")==t+u){i=d;break}}i||(l=!0,i=document.createElement("script"),i.charset="utf-8",i.timeout=120,n.nc&&i.setAttribute("nonce",n.nc),i.setAttribute("data-webpack",t+u),i.src=a),e[a]=[o];var f=function(t,n){i.onerror=i.onload=null,clearTimeout(v);var o=e[a];if(delete e[a],i.parentNode&&i.parentNode.removeChild(i),o&&o.forEach((function(e){return e(n)})),t)return t(n)},v=setTimeout(f.bind(null,void 0,{type:"timeout",target:i}),12e4);i.onerror=f.bind(null,i.onerror),i.onload=f.bind(null,i.onload),l&&document.head.appendChild(i)}}}(),function(){n.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})}}(),function(){n.p="/v/"}(),function(){var e={524:0};n.f.j=function(t,a){var o=n.o(e,t)?e[t]:void 0;if(0!==o)if(o)a.push(o[2]);else{var u=new Promise((function(n,a){o=e[t]=[n,a]}));a.push(o[2]=u);var r=n.p+n.u(t),i=new Error,l=function(a){if(n.o(e,t)&&(o=e[t],0!==o&&(e[t]=void 0),o)){var u=a&&("load"===a.type?"missing":a.type),r=a&&a.target&&a.target.src;i.message="Loading chunk "+t+" failed.\n("+u+": "+r+")",i.name="ChunkLoadError",i.type=u,i.request=r,o[1](i)}};n.l(r,l,"chunk-"+t,t)}},n.O.j=function(t){return 0===e[t]};var t=function(t,a){var o,u,r=a[0],i=a[1],l=a[2],c=0;if(r.some((function(t){return 0!==e[t]}))){for(o in i)n.o(i,o)&&(n.m[o]=i[o]);if(l)var s=l(n)}for(t&&t(a);c<r.length;c++)u=r[c],n.o(e,u)&&e[u]&&e[u][0](),e[u]=0;return n.O(s)},a=self["webpackChunklocalpage2"]=self["webpackChunklocalpage2"]||[];a.forEach(t.bind(null,0)),a.push=t.bind(null,a.push.bind(a))}();var a=n.O(void 0,[504],(function(){return n(7996)}));a=n.O(a)})();
//# sourceMappingURL=app.60b765a8.js.map