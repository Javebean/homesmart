// ==UserScript==
// @name         OpenWRT fastgo
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  OpenWRT 快速访问
// @author       You
// @match        */cgi-bin/luci/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=google.com
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @grant        GM_deleteValue
// ==/UserScript==

(function() {
    'use strict';

    let ITEM_COUNT = 5;

     //create desc div
    let createDesc = function (descri) {
        const desc = document.createElement('span');
        desc.innerHTML=descri;
        desc.classList.add("fastgo_desc");
        return desc;
    }

    // create whole container div
    let createFastContainer = function () {
        let container = document.querySelector("body header div.container div.fastgo-container")
        if(!container){
            container = document.createElement('div');
            container.classList.add("fastgo-container");
            //body > header > div > div
            $("body header div.container").append(container);
        }
        return container;
    }

     //create every row contain desc label and item buttons
    let createLinkButton = function (arr,desc) {
        let container = createFastContainer();
        let rowDiv = document.createElement('div');
        rowDiv.classList.add("fastgo-row");
            //body > header > div > div
        $(container).append(rowDiv);
        $(rowDiv).append(createDesc(desc));
        for (var v of arr) {
            const button = document.createElement('a');
            button.innerHTML=v.name+"("+v.times+")";
            button.href = v.url;
            button.classList.add("fastgo0820");
            //body > header > div > div
            $(rowDiv).append(button);
        }
    }

    function compare( a, b ) {
        if ( a.times < b.times ){
            return 1;
        }
        if ( a.times > b.times ){
            return -1;
        }
        return 0;
    }

    let getCurUrl = function(){
        let curl = window.location.href;
        return curl;
    }

    let getVisitedKey2 = function(){
        let curl = getCurUrl();
         //刚登录进来的url，不记录
        if(!curl.endsWith("/cgi-bin/luci/")){
            let params = curl.split("/");
            // alert(params[params.length-2]+"_"+params[params.length-1])
            return params[params.length-2]+"_"+params[params.length-1];
        }
    }

    // get active meau
    let   getVisitedKey = function(){
        let meauTitle = document.querySelectorAll("body > div > div.main-left > ul > li > .menu.active")
        let active = document.querySelectorAll("body > div > div.main-left > ul > li > ul > li.active");
        console.log(meauTitle)
        let clickName;
        let menuName;
        if(meauTitle.length != 1){
            let paths = getCurUrl().split("/");
            menuName = paths[paths.length-2];
        }else{
            menuName = meauTitle[0].innerText;
        }
        if(active.length>1){
            let paths = getCurUrl().split("/");
            clickName = paths[paths.length-1];
        }else{
            clickName = active[0].innerText;
        }
        return menuName+"-"+clickName;
    }

      //记录每页数据被访问次数
    let defaultVisitedData = {
        name  : getVisitedKey(),
        url   : getCurUrl(),
        times : 1//默认访问次数为1
    }

    let getStorage = {
        getVisitedArr: () => {
            let data = GM_getValue("visitedArr") || [];
            return data;
        },
        setVisitedArr: (data) => {
            GM_setValue("visitedArr", data);
        },
        getVisitedDataIndex: (key) => {
            var index = getStorage.getVisitedArr().findIndex(obj => {
                //console.log(obj.name, "--",key)
                return obj.name == key
            })
            return index;
        },
        getVisitedData: (key) => {
            var result = getStorage.getVisitedArr().find(obj => {
                //console.log( obj.name==key)
                return obj.name == key
            })
            return result;
        },
        setVisitedTimes: (key) => {
            let index = getStorage.getVisitedDataIndex(key);
            //console.log(index);
            let arr = getStorage.getVisitedArr();
            if(index > -1){
                let item = arr[index];
                item.times++
                arr.splice(index, 1);
                arr.splice(0,0,item);
            } else{
                if(arr.length > ITEM_COUNT){
                    arr.pop();
                }
                arr.unshift(defaultVisitedData);
            }
            getStorage.setVisitedArr(arr);
        }
    }

    let loadPage = function(){
        //GM_deleteValue("visitedArr")
        //把当前页加入访问次数 数据结构
        getStorage.setVisitedTimes(getVisitedKey());
        //console.log(getStorage.getVisitedArr());

        let visitedData = getStorage.getVisitedArr();
        createLinkButton(visitedData,"最近访问>> ");
        visitedData.sort( compare );
        createLinkButton(visitedData,"最多访问>> ");

    }
    loadPage()

    //openwrt's container in head must set height 100%
    let css=`
      div.container,div.fastgo-container {
        height:100%;
      }
      div.fastgo-container {
        display: -webkit-flex; /* Safari */
        display: flex;
        flex-direction:column;
        justify-content:center;
        font-size:10px;
      }

      .fastgo0820 {
        background-color: #4CAF50; /* Green */
        border: none;
        border-radius:4px;
        color: white;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        margin:2px 4px;
        padding:1px 5px;
      }
    `
    GM_addStyle(css)


})();