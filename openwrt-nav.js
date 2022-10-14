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
// @require      file://d:\fstage\1.program\homesmart\openwrt-nav.js
// ==/UserScript==

(function () {
    'use strict';

    let ITEM_COUNT = 3;

    var Util = {
        getCurUrl: function () {
            let curl = window.location.href;
            return curl;
        },
        //按照点击次数大小排序
        compare: function (a, b) {
            if (a.times < b.times) {
                return 1;
            }
            if (a.times > b.times) {
                return -1;
            }
            return 0;
        },
        appendSlash: function (url) {
            if (!url.endsWith('/')) {
                url += '/';
            }
            return url;
        }
    }




    //记录每页数据被访问次数
    let defaultVisitedData = {
        name: '',
        url: '',
        times: 1//默认访问次数为1
    }

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

    //
    function checkPasswallNode() {
        $("button.opnav-check-used").click(async function () {
            let ckBts = document.querySelectorAll('input[type="button"][value="可用性测试"].cbi-button');
            let len = ckBts.length;
            for (let i = 0; i < len; i++) {
                $(ckBts[i]).trigger("click");
                console.log("click" + i);
                await sleep(100);
                if (i == len - 1) {
                    //loop done..
                    // mostAvailability();
                }
            }
        });
    }

    function mostAvailability() {
        // todo
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
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

            loadPageDate();
        }
    }();


    //create every row contain desc label and item buttons
    function createRecentLink(arr) {
        let row1 = createRightRow1();
        for (var v of arr) {
            const button = document.createElement('a');
            button.innerHTML = v.name + "(" + v.times + ")";
            button.href = v.url;
            button.classList.add("opnav-link-item");
            $(row1).append(button);
        }
    }
    function createMoreAccessLink(arr) {
        let row2 = createRightRow2();
        for (var v of arr) {
            const button = document.createElement('a');
            button.innerHTML = v.name + "(" + v.times + ")";
            button.href = v.url;
            button.classList.add("opnav-link-item");
            $(row2).append(button);
        }
    }

    // get active meau
    function getVisitedKey() {
        let curUrl = Util.getCurUrl();
        curUrl = Util.appendSlash(curUrl);
        //http://xxx/cgi-bin/luci/ 初始首页
        if (curUrl.endsWith('luci/')) {
            return;
        }
        let menuLi = document.querySelectorAll("ul.slide-menu li a");
        var liArr = [...menuLi]; // converts NodeList to Array
        liArr.forEach(e => {
            let itemUrl = $(e).attr('href').toLowerCase();
            itemUrl = Util.appendSlash(itemUrl);
            if (curUrl.indexOf(itemUrl) > -1) {
                console.log(curUrl, e);
                $(e).parent().addClass('active');
                $(e).parent().parent().addClass('active').css({ 'display': 'block' });
                // $(e).parent().parent().prev().addClass('active');
            } else {
                $(e).parent().removeClass('active');
                $(e).parent().parent().removeClass('active');
                // $(e).parent().parent().prev().removeClass('active');
            }
        });

        let meauTitle = document.querySelectorAll("body > div > div.main-left > ul > li > .menu.active")
        let active = document.querySelectorAll("body > div > div.main-left > ul > li > ul > li.active");
        // console.log(meauTitle)
        let clickName;
        let menuName;
        if (meauTitle.length != 1) {
            let paths = Util.getCurUrl().split("/");
            menuName = paths[paths.length - 2];
        } else {
            menuName = meauTitle[0].innerText;
        }
        if (active.length > 1) {
            let paths = Util.getCurUrl().split("/");
            clickName = paths[paths.length - 1];
        } else {
            clickName = active[0].innerText;
        }

        // init defaultObj
        defaultVisitedData.name = menuName + "-" + clickName;
        defaultVisitedData.url = curUrl;
        return menuName + "-" + clickName;
    }

    function getVisitedArr() {
        let data = GM_getValue("visitedArr") || [];
        return data;
    }

    function setVisitedArr(data) {
        GM_setValue("visitedArr", data);
    }

    function getVisitedDataIndex(key) {
        var index = getVisitedArr().findIndex(obj => {
            //console.log(obj.name, "--",key)
            return obj.name == key
        })
        return index;
    }

    // op data in GM
    function setVisitedTimes(key) {
        if (key) {
            let index = getVisitedDataIndex(key);
            let arr = getVisitedArr();
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
            setVisitedArr(arr);
        }
    }

    function loadPageDate() {
        //GM_deleteValue("visitedArr")
        //把当前页加入访问次数 数据结构
        setVisitedTimes(getVisitedKey());
        //console.log(getVisitedArr());

        let visitedData = getVisitedArr();
        createRecentLink(visitedData);

        visitedData.sort(Util.compare);
        createMoreAccessLink(visitedData);
    }

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
            width: 3000px;
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