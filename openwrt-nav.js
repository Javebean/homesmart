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

(function () {
    'use strict';

    let ITEM_COUNT = 3;

    // create whole container div
    function createOpNavContainer() {
        let container = document.querySelector("body header div.container div.opnav-container");
        if (!container) {
            container = document.createElement('div');
            container.classList.add("opnav-container");
        }
        //body > header > div > div
        // $("body header div.container").append(container);
        return container;
    }

    //
    function createSearchContainer() {
        let container = document.querySelector("div.opnav-search-container");
        if (!container) {
            container = document.createElement('div');
            container.classList.add("opnav-search-container");
        }
        //body > header > div > div
        // $("body header div.container").append(container);
        $(container).css("position", "relative");
        return container;
    }


    function createSearchBar() {
        let searchBar = document.querySelector("input.opnav-search-bar")
        if (!searchBar) {
            searchBar = document.createElement('input');
            searchBar.classList.add("opnav-search-bar");
        }
        return searchBar;
    }

    function createSearchOptions(options) {
        let datalist = document.querySelector("div.opnav-search-datalist")
        if (!datalist) {
            datalist = document.createElement('div');
            datalist.classList.add("opnav-search-datalist");
        }
        // if (!options) {

        // }
        $(datalist).css("min-width", "100%");
        $(datalist).css("background-color", "#fff");
        $(datalist).css("position", "absolute");

        $(datalist).empty();
        for (var v of options) {
            console.log(v);
            $(datalist).append(v);
        }
        let searchbar = createSearchContainer();
        console.log(datalist);
        $(searchbar).append(datalist);
    }

    // buttons in right container
    function createRightContainer() {
        const rightDiv = document.createElement('div');
        rightDiv.classList.add("opnav-right-container");
        return rightDiv;
    }

    // one row in right container
    function createRightRow1() {
        let rightRow = document.querySelector("div.opnav-right-row1")
        if (!rightRow) {
            rightRow = document.createElement('div');
            rightRow.classList.add("opnav-right-row1");
            rightRow.classList.add("opnav-right-row");
        }
        return rightRow;
    }

    // anther row in right container
    function createRightRow2() {
        let rightRow = document.querySelector("div.opnav-right-row2")
        if (!rightRow) {
            rightRow = document.createElement('div');
            rightRow.classList.add("opnav-right-row2");
            rightRow.classList.add("opnav-right-row");
        }
        return rightRow;
    }

    //create button's label
    function createLabel(text) {
        const label = document.createElement('span');
        label.innerHTML = text;
        label.classList.add("opnav-bt-label");
        return label;
    }

    function createToolBox() {
        const tb = document.createElement('div');
        tb.classList.add("opnav-tool-box");
        return tb;
    }

    function createCheckUsed() {
        const tb = document.createElement('button');
        tb.classList.add("opnav-check-used");
        tb.innerText = "check"
        return tb;
    }

    function checkPasswallNode() {
        $("button.opnav-check-used").click(function () {
            let ckBts = document.querySelectorAll('input[type="button"][value="可用性测试"].cbi-button');
            $(ckBts).each(function () {
                console.log(this);
                $(this).trigger("click");
            });
        });
    }

    // 拼装基本组件
    function initBaseComponents() {
        let container = createOpNavContainer();
        let searchCon = createSearchContainer();
        let searchBar = createSearchBar();
        let rightCont = createRightContainer();
        let rightRow1 = createRightRow1();
        let rightRow2 = createRightRow2();
        let toolbox = createToolBox();
        let checkUsedBt = createCheckUsed();


        // 组装
        let op_container = document.querySelector("body header div.container");
        $(op_container).append(container);

        $(container).append(searchCon);
        $(container).append(toolbox);
        $(toolbox).append(checkUsedBt);
        checkPasswallNode();


        $(searchCon).append(searchBar);
        $(container).append(rightCont);

        $(rightCont).append(rightRow1);
        $(rightCont).append(rightRow2);

        $(rightRow1).append(createLabel("最近>>"));
        $(rightRow2).append(createLabel("最多>>"));
        console.log("init done...")

        //输入监听
        $(searchBar).on("input propertychange", function (event) {

            let val = $(searchBar).val();
            let options = [];
            if (val) {
                $("div.main-left").find("a").map(function (i, v) {
                    if ($(v).text().toLowerCase().indexOf(val.toLowerCase()) > -1) {
                        options.push('<div>' + v.outerHTML + '</div>');
                    }
                })
            }
            createSearchOptions(options);
        });
    };

    let isLoginIn = function () {
        let input_pwd = document.querySelector('input[type="password"]');
        // console.log(input_pwd);
        if (!input_pwd) {
            initBaseComponents();
        }
    }();


    //create every row contain desc label and item buttons
    let createRecentLink = function (arr) {
        let row1 = createRightRow1();
        for (var v of arr) {
            const button = document.createElement('a');
            button.innerHTML = v.name + "(" + v.times + ")";
            button.href = v.url;
            button.classList.add("opnav-link-item");
            $(row1).append(button);
        }
    }
    let createMoreAccessLink = function (arr) {
        let row2 = createRightRow2();
        for (var v of arr) {
            const button = document.createElement('a');
            button.innerHTML = v.name + "(" + v.times + ")";
            button.href = v.url;
            button.classList.add("opnav-link-item");
            $(row2).append(button);
        }
    }




    //按照点击次数大小排序
    function compare(a, b) {
        if (a.times < b.times) {
            return 1;
        }
        if (a.times > b.times) {
            return -1;
        }
        return 0;
    }

    let getCurUrl = function () {
        let curl = window.location.href;
        return curl;
    }

    let getVisitedKey2 = function () {
        let curl = getCurUrl();
        //刚登录进来的url，不记录
        if (!curl.endsWith("/cgi-bin/luci/")) {
            let params = curl.split("/");
            // alert(params[params.length-2]+"_"+params[params.length-1])
            return params[params.length - 2] + "_" + params[params.length - 1];
        }
    }

    // get active meau
    let getVisitedKey = function () {
        let meauTitle = document.querySelectorAll("body > div > div.main-left > ul > li > .menu.active")
        let active = document.querySelectorAll("body > div > div.main-left > ul > li > ul > li.active");
        console.log(meauTitle)
        let clickName;
        let menuName;
        if (meauTitle.length != 1) {
            let paths = getCurUrl().split("/");
            menuName = paths[paths.length - 2];
        } else {
            menuName = meauTitle[0].innerText;
        }
        if (active.length > 1) {
            let paths = getCurUrl().split("/");
            clickName = paths[paths.length - 1];
        } else {
            clickName = active[0].innerText;
        }
        return menuName + "-" + clickName;
    }

    //记录每页数据被访问次数
    let defaultVisitedData = {
        name: getVisitedKey(),
        url: getCurUrl(),
        times: 1//默认访问次数为1
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
            if (index > -1) {
                let item = arr[index];
                item.times++
                arr.splice(index, 1);
                arr.splice(0, 0, item);
            } else {
                if (arr.length > ITEM_COUNT) {
                    arr.pop();
                }
                arr.unshift(defaultVisitedData);
            }
            getStorage.setVisitedArr(arr);
        }
    }

    let loadPage = function () {
        //GM_deleteValue("visitedArr")
        //把当前页加入访问次数 数据结构
        getStorage.setVisitedTimes(getVisitedKey());
        //console.log(getStorage.getVisitedArr());

        let visitedData = getStorage.getVisitedArr();
        createRecentLink(visitedData, "最近访问>> ");
        visitedData.sort(compare);
        createMoreAccessLink(visitedData, "最多访问>> ");

    }
    loadPage()

    //openwrt's container in head must set height 100%
    let css = `
        div.container,div.opnav-container {
            height:100%;
        }

        div.opnav-container {
            display: -webkit-flex; /* Safari */
            display: flex;
            justify-content: flex-start;
            align-items: center;
            font-size:10px;
        }

        .opnav-right-container{
            width:100%;
            overflow-x: scroll;
        }

        .opnav-right-row {
            width: 1000px;
        }

        .opnav-link-item {
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