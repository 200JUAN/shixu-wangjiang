// ===================== 全局存储与管理员账号 =====================
const storage = window.localStorage;
const adminUser = {
    name: "admin",
    pwd: "admin123"
};

// ===================== 民族名称映射 =====================
const nationNameMap = {
    "miao": "苗族",
    "buyi": "布依族",
    "dong": "侗族",
    "shui": "水族",
    "yi": "彝族",
    "yao": "瑶族",
    "gelao": "仡佬族",
    "tujia": "土家族",
    "zhuang": "壮族",
    "hui": "回族",
    "bai": "白族",
    "she": "畲族",
    "maonan": "毛南族",
    "mulao": "仫佬族",
    "man": "满族",
    "mong": "蒙古族",
    "qiang": "羌族"
};

// ===================== AI民俗知识库 =====================
const festivalKnowledge = {
    "苗年": "苗族岁首大典，芦笙舞、长桌宴、银饰盛装。凌晨祭祖，清晨鸣炮宣告新年，持续3-15天不等。2008年列入国家级非物质文化遗产。",
    "火把节": "彝族最高传统节日，篝火驱邪、斗牛赛马。农历六月二十四点燃松木火把绕行田间，祈求丰收。2006年列入国家级非物质文化遗产。",
    "三月三": "布依族山歌盛会，祭祀山神、青年对歌。蒸五色糯米饭，碰彩蛋定情，连续3天。广西/贵州多地省级非遗。",
    "萨玛节": "侗族祭祀圣母萨玛，大歌展演。春耕前举行，祈求村寨平安，女性主导祭祀。2006年列入国家级非物质文化遗产。",
    "端节": "水族新年，世界最长年节（49天分批过）。水历十二月至二月，赛马、铜鼓舞、鱼包韭菜。2006年列入国家级非物质文化遗产。",
    "盘王节": "瑶族祭祀始祖盘瓠，还盘王愿。农历十月十六，跳长鼓舞，唱《盘王歌》。2006年列入国家级非物质文化遗产。",
    "姊妹节": "苗族情人节，姊妹饭传情。农历三月十五至十七，姑娘备五彩姊妹饭赠心仪男子。",
    "四月八": "苗族祭祀节，纪念英雄亚努。农历四月初八，蒸糯米饭、吹芦笙、跳鼓舞。",
    "吃新节": "苗族、侗族庆丰收，尝新米。农历七月，摘稻穗祭祖，全寨聚餐。",
    "鼓藏节": "苗族最隆重祭祖大典，13年一次。杀牛祭祖，跳芦笙舞，历时3-5天。",
    "六月六": "布依族祭田节，晒经书。农历六月初六，祭盘古、唱山歌、包粽子。",
    "查白歌节": "布依族情人节，纪念查郎与白妹。农历六月二十一至二十三，对歌择偶。",
    "龙舟节": "苗族、侗族竞渡，祈求风调雨顺。农历五月，龙舟竞渡、抢鸭子。",
    "卯节": "水族歌节，青年对歌择偶。水历九月，卯坡对歌、饮酒宴客。",
    "独木龙舟节": "苗族特色龙舟，单木挖空成舟。农历五月二十四至二十七，竞渡、斗牛、踩鼓。",
    "牛王节": "布依族、苗族敬牛神。农历四月初八，让牛休息，喂糯米饭、刷牛身。",
    "喊天节": "苗族求雨仪式。农历六月十五，祭师登喊天台，率众祈雨。",
    "摔跤节": "侗族传统竞技。农历三月十五，青年男子摔跤角力，胜者获姑娘青睐。",
    "二月二祭老人房": "苗族敬老节。农历二月初二，全寨老人聚餐，青年侍奉。",
    "三月三播种节": "布依族农事节。农历三月初三，祭山神、播种、吃三色饭。",
    "仡佬年": "仡佬族新年。农历三月初三，祭祖宗、打糍粑、跳踩堂舞。",
    "敬雀节": "仡佬族护鸟节。农历二月初一，祭鸟神、禁捕鸟、播树种。",
    "摆手节": "土家族祭祀节。正月初九，跳摆手舞、唱摆手歌，缅怀祖先。",
    "织锦节": "土家族女儿节。农历七月七，姑娘织西兰卡普，比手艺、定姻缘。"
};

// ===================== 页面初始化 =====================
window.onload = function () {
    checkLoginStatus();
    tabSwitchInit();
    bindModalEvent();
    countDataStat();
}

// 首页收藏、AI生成数据统计
// 首页收藏、AI生成数据统计
function countDataStat() {
    // 修正：使用 localStorage，默认空数组
    let collectWrap = JSON.parse(localStorage.getItem("userList") || "[]");
    let totalCollect = 0;
    let aiTotal = 0;
    collectWrap.forEach(user => {
        // 兼容：collect不存在则为空数组
        let userCollect = Array.isArray(user.collect) ? user.collect : [];
        totalCollect += userCollect.length;
        // 兼容：ailog不存在则为空数组，避免undefined.length报错
        let userAiLog = Array.isArray(user.ailog) ? user.ailog : [];
        aiTotal += userAiLog.length;
    });
    let collectDom = document.getElementById("collect-count");
    let aiDom = document.getElementById("ai-count");
    if (collectDom) collectDom.innerText = totalCollect;
    if (aiDom) aiDom.innerText = aiTotal;
}

// 导航登录按钮状态切换
function checkLoginStatus() {
    let user = storage.getItem("nowUser");
    let loginBtn = document.getElementById("login-btn");
    if (!loginBtn) return;
    if (user) {
        let userObj = JSON.parse(user);
        loginBtn.innerText = "私藏时序";
        loginBtn.href = "user.html";
        if (userObj.type == "admin") {
            let navWrap = document.querySelector(".nav-list");
            if (!navWrap.querySelector('a[href="admin.html"]')) {
                let adminA = document.createElement("a");
                adminA.href = "admin.html";
                adminA.innerText = "时册后台";
                navWrap.appendChild(adminA);
            }
        }
    }
}

// 通用标签切换
function tabSwitchInit() {
    let allTabBtn = document.querySelectorAll(".user-tab-btn,.admin-tab-btn");
    allTabBtn.forEach(btn => {
        btn.onclick = function () {
            let parentBox = this.parentElement;
            let allBtns = parentBox.querySelectorAll("button");
            let tabType = this.dataset.tab;
            allBtns.forEach(b => b.classList.remove("active"));
            this.classList.add("active");
            let allContent = document.querySelectorAll(".user-content,.admin-content");
            allContent.forEach(c => c.classList.remove("active"));
            let target = document.getElementById(tabType);
            if (target) target.classList.add("active");
        }
    })
    let loginTab = document.getElementById("login-tab");
    let regTab = document.getElementById("reg-tab");
    let loginForm = document.querySelector(".login-form");
    let regForm = document.querySelector(".reg-form");
    if (loginTab) {
        loginTab.onclick = () => {
            loginTab.classList.add("active");
            regTab.classList.remove("active");
            loginForm.classList.remove("hidden");
            regForm.classList.add("hidden");
        }
        regTab.onclick = () => {
            regTab.classList.add("active");
            loginTab.classList.remove("active");
            regForm.classList.remove("hidden");
            loginForm.classList.add("hidden");
        }
    }
}

// 节日弹窗关闭事件
function bindModalEvent() {
    let modal = document.getElementById("fest-modal");
    let closeBtn = document.querySelector(".close-modal");
    if (!modal) return;
    closeBtn.onclick = () => modal.style.display = "none";
    modal.onclick = function (e) {
        if (e.target == modal) modal.style.display = "none";
    }
}

// ===================== 登录/注册/退出 =====================
let loginSubmit = document.getElementById("login-submit");
if (loginSubmit) {
    loginSubmit.onclick = function () {
        let name = document.getElementById("login-username").value.trim();
        let pwd = document.getElementById("login-pwd").value.trim();
        let userType = document.querySelector("input[name='user-type']:checked").value;
        if (!name || !pwd) {
            alert("请填写用户名与密码");
            return;
        }
        if (userType == "admin") {
            if (name == adminUser.name && pwd == adminUser.pwd) {
                storage.setItem("nowUser", JSON.stringify({ name: name, type: "admin" }));
                alert("管理员登录成功，跳转后台");
                window.location.href = "admin.html";
                return;
            } else {
                alert("管理员账号密码错误");
                return;
            }
        }
        let allUser = JSON.parse(storage.getItem("userList") || "[]");
        let findUser = allUser.find(u => u.name == name && u.pwd == pwd);
        if (findUser) {
            storage.setItem("nowUser", JSON.stringify(findUser));
            alert("登录成功，跳转个人中心");
            window.location.href = "user.html";
        } else {
            alert("用户名或密码不存在，请先注册");
        }
    }
}

let regSubmit = document.getElementById("reg-submit");
if (regSubmit) {
    regSubmit.onclick = function () {
        let name = document.getElementById("reg-name").value.trim();
        let pwd = document.getElementById("reg-pwd").value.trim();
        let phone = document.getElementById("reg-phone").value.trim();
        let email = document.getElementById("reg-email").value.trim();
        if (!name || !pwd || !phone || !email) {
            alert("全部信息必须填写");
            return;
        }
        let allUser = JSON.parse(storage.getItem("userList") || "[]");
        let repeat = allUser.find(u => u.name == name);
        if (repeat) {
            alert("昵称已被占用");
            return;
        }
        let newUser = {
            name: name,
            pwd: pwd,
            phone: phone,
            email: email,
            type: "user",
            collect: [],
            remind: [],
            aiLog: []
        };
        allUser.push(newUser);
        storage.setItem("userList", JSON.stringify(allUser));
        storage.setItem("nowUser", JSON.stringify(newUser));
        alert("注册成功，自动登录");
        window.location.href = "user.html";
    }
}

let logoutBtn = document.getElementById("logout-btn");
let adminLogout = document.getElementById("admin-logout");
if (logoutBtn) {
    logoutBtn.onclick = function () {
        storage.removeItem("nowUser");
        alert("已退出登录");
        window.location.href = "index.html";
    }
}
if (adminLogout) {
    adminLogout.onclick = function () {
        storage.removeItem("nowUser");
        alert("管理员退出");
        window.location.href = "index.html";
    }
}

// ===================== AI科普文案生成（增强版） =====================
let aiGenBtn = document.getElementById("ai-generate");
if (aiGenBtn) {
    aiGenBtn.onclick = function () {
        let input = document.getElementById("ai-input").value.trim();
        if (!input) {
            alert("请输入节日名称");
            return;
        }
        let resBox = document.getElementById("ai-result");
        resBox.innerText = "正在检索民俗知识库...";
        resBox.style.color = "#999";

        setTimeout(() => {
            let knowledge = festivalKnowledge[input];
            let text;
            if (knowledge) {
                text = `【${input}科普短文】\n\n${knowledge}\n\n【体验建议】\n节日期间可观赏核心仪式，建议尊重当地禁忌，提前联系村寨确认具体日期（部分节日按传统历法择吉日举行，每年公历日期浮动）。`;
            } else {
                text = `【${input}科普短文】\n\n${input}是贵州少数民族特色节庆，具体信息正在完善中。建议通过"时序历馆"查看该节日的举办时间与民族归属，或查阅《贵州民族节日志》获取详细民俗记录。`;
            }

            resBox.style.color = "#333";
            resBox.innerText = text;

            let nowUser = JSON.parse(storage.getItem("nowUser") || "null");
            if (nowUser) {
                nowUser.aiLog.push({ title: input, text: text, time: Date.now() });
                storage.setItem("nowUser", JSON.stringify(nowUser));
                let userList = JSON.parse(storage.getItem("userList") || "[]");
                let idx = userList.findIndex(u => u.name == nowUser.name);
                if (idx > -1) userList[idx] = nowUser;
                storage.setItem("userList", JSON.stringify(userList));
                countDataStat();
            }
        }, 600);
    }
}

// ===================== 收藏与提醒 =====================
let collectBtn = document.getElementById("collect-btn");
if (collectBtn) {
    collectBtn.onclick = function () {
        let nowUser = JSON.parse(storage.getItem("nowUser") || "null");
        if (!nowUser) {
            alert("请先登录后收藏");
            window.location.href = "login.html";
            return;
        }
        let festName = document.getElementById("modal-name").innerText;
        if (nowUser.collect.includes(festName)) {
            alert("已收藏过该节日");
            return;
        }
        nowUser.collect.push(festName);
        storage.setItem("nowUser", JSON.stringify(nowUser));
        let userList = JSON.parse(storage.getItem("userList") || "[]");
        let idx = userList.findIndex(u => u.name == nowUser.name);
        if (idx > -1) userList[idx] = nowUser;
        storage.setItem("userList", JSON.stringify(userList));
        countDataStat();
        alert("收藏成功，可前往私藏时序查看");
    }
}

let remindBtn = document.getElementById("remind-btn");
if (remindBtn) {
    remindBtn.onclick = function () {
        let nowUser = JSON.parse(storage.getItem("nowUser") || "null");
        if (!nowUser) {
            alert("请先登录设置提醒");
            window.location.href = "login.html";
            return;
        }
        let festName = document.getElementById("modal-name").innerText;
        let festTime = document.getElementById("modal-time").innerText;
        let remindObj = { name: festName, time: festTime };
        nowUser.remind.push(remindObj);
        storage.setItem("nowUser", JSON.stringify(nowUser));
        let userList = JSON.parse(storage.getItem("userList") || "[]");
        let idx = userList.findIndex(u => u.name == nowUser.name);
        if (idx > -1) userList[idx] = nowUser;
        storage.setItem("userList", JSON.stringify(userList));
        alert("预约提醒添加成功，节日将至将推送通知");
    }
}

// ===================== 非遗项目收藏（culture.html） =====================
document.querySelectorAll(".culture-card .enter-btn").forEach(btn => {
    btn.onclick = function () {
        let nowUser = JSON.parse(storage.getItem("nowUser") || "null");
        if (!nowUser) {
            alert("请先登录后收藏");
            window.location.href = "login.html";
            return;
        }
        let craftName = this.parentElement.querySelector("h4").innerText;
        let saveKey = "[非遗]" + craftName;
        if (nowUser.collect.includes(saveKey)) {
            alert("已收藏过该项目");
            return;
        }
        nowUser.collect.push(saveKey);
        storage.setItem("nowUser", JSON.stringify(nowUser));
        let userList = JSON.parse(storage.getItem("userList") || "[]");
        let idx = userList.findIndex(u => u.name == nowUser.name);
        if (idx > -1) userList[idx] = nowUser;
        storage.setItem("userList", JSON.stringify(userList));
        countDataStat();
        alert("非遗收藏成功，可前往私藏时序查看");
    }
});

// ===================== 原版五层错落轮播（截图同款逻辑） =====================
let currentIndex = 0;
const items = document.querySelectorAll(".carousel-item");
const dots = document.querySelectorAll(".dot");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
let autoTimer;
const totalNum = items.length;

function updateCarousel() {
    if (totalNum === 0) return;
    items.forEach(item => item.className = "carousel-item");
    dots.forEach(d => d.classList.remove("active"));
    dots[currentIndex].classList.add("active");

    const centerIdx = currentIndex;
    const r1 = (currentIndex + 1) % totalNum;
    const r2 = (currentIndex + 2) % totalNum;
    const l1 = (currentIndex - 1 + totalNum) % totalNum;
    const l2 = (currentIndex - 2 + totalNum) % totalNum;

    items[centerIdx].classList.add("center");
    items[r1].classList.add("right1");
    items[r2].classList.add("right2");
    items[l1].classList.add("left1");
    items[l2].classList.add("left2");
}

function slideNext() {
    currentIndex = (currentIndex + 1) % totalNum;
    updateCarousel();
}
function slidePrev() {
    currentIndex = (currentIndex - 1 + totalNum) % totalNum;
    updateCarousel();
}

function autoStart() {
    autoTimer = setInterval(slideNext, 3000);
}
function autoStop() {
    clearInterval(autoTimer);
}

if (prevBtn) prevBtn.onclick = () => { autoStop(); slidePrev(); autoStart(); }
if (nextBtn) nextBtn.onclick = () => { autoStop(); slideNext(); autoStart(); }
dots.forEach(dot => {
    dot.onclick = function () {
        autoStop();
        currentIndex = Number(this.dataset.num);
        updateCarousel();
        autoStart();
    }
})
const box = document.querySelector(".banner-box");
if (box) {
    box.onmouseenter = autoStop;
    box.onmouseleave = autoStart;
}

window.addEventListener("DOMContentLoaded", () => {
    updateCarousel();
    autoStart();
});

// ===================== 日历页面交互 =====================
const nationSelect = document.getElementById("nationSelect");
const tabBtns = document.querySelectorAll(".filter-box .tab-btn");
const tabContents = document.querySelectorAll(".tab-content");
const listWrap = document.getElementById("listWrap");
const monthWrap = document.getElementById("monthWrap");

tabBtns.forEach(btn => {
    btn.onclick = function () {
        tabBtns.forEach(b => b.classList.remove("active"));
        tabContents.forEach(c => c.classList.remove("active"));
        this.classList.add("active");
        const targetTabId = this.dataset.tab;
        document.getElementById(targetTabId).classList.add("active");
        filterFestivalByNation(nationSelect.value);
    }
});

if (nationSelect) {
    nationSelect.onchange = function () {
        filterFestivalByNation(this.value);
    }
}

function filterFestivalByNation(nationCode) {
    let filterArr = [];
    if (nationCode === "all") {
        filterArr = festData;
    } else {
        filterArr = festData.filter(item => item.nation === nationCode);
    }
    renderFestivalList(filterArr);
    renderMonthCalendar(filterArr);
}

function renderFestivalList(data) {
    if (!listWrap) return;
    listWrap.innerHTML = "";
    if (data.length === 0) {
        listWrap.innerHTML = `<p style="grid-column:1/-1;text-align:center;padding:60px;font-size:16px;">当前民族暂无收录节庆</p>`;
        return;
    }
    data.forEach(festival => {
        let cardDom = document.createElement("div");
        cardDom.className = "fest-card";
        const showTime = getShowTime(festival.time);
        const nationName = nationNameMap[festival.nation] || festival.nation;
        cardDom.innerHTML = `
            <img src="${festival.img}" alt="${festival.name}" onerror="this.style.display='none'">
            <h4>${festival.name}</h4>
            <p style="color:#7c2e2e;font-size:13px;margin-top:4px;">${nationName}</p>
            <p>举办时间：${showTime}</p>
        `;
        cardDom.onclick = function () {
            openModal(festival);
        }
        listWrap.appendChild(cardDom);
    });
}

function renderMonthCalendar(data) {
    if (!monthWrap) return;
    monthWrap.innerHTML = "";
    monthWrap.style.display = "grid";
    monthWrap.style.gridTemplateColumns = "repeat(4, 1fr)";
    monthWrap.style.gap = "12px";

    const monthName = ["正月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "冬月", "腊月"];

    monthName.forEach((m, idx) => {
        let monthBox = document.createElement("div");
        monthBox.style.cssText = "background:#fff;border:1px solid #e8e8e8;border-radius:8px;padding:12px;min-height:120px;";

        let header = document.createElement("div");
        header.innerText = m;
        header.style.cssText = "font-weight:bold;color:#7c2e2e;font-size:16px;margin-bottom:8px;padding-bottom:6px;border-bottom:2px solid #f5f5f5;";
        monthBox.appendChild(header);

        let festList = document.createElement("div");
        festList.style.cssText = "display:flex;flex-direction:column;gap:6px;";

        let monthFests = data.filter(fest => getMonthNum(fest.time) === idx);

        if (monthFests.length === 0) {
            festList.innerHTML = '<span style="color:#bbb;font-size:13px;">暂无收录</span>';
        } else {
            monthFests.forEach(fest => {
                let tag = document.createElement("span");
                tag.innerText = fest.name;
                tag.style.cssText = "display:block;color:#333;font-size:14px;padding:5px 8px;background:#fafafa;border-radius:4px;cursor:pointer;transition:all 0.2s;";
                tag.onmouseenter = () => tag.style.background = "#f0e6e6";
                tag.onmouseleave = () => tag.style.background = "#fafafa";
                tag.onclick = () => openModal(fest);
                festList.appendChild(tag);
            });
        }

        monthBox.appendChild(festList);
        monthWrap.appendChild(monthBox);
    });
}

function getMonthNum(timeStr) {
    if (timeStr.includes("正月")) return 0;
    if (timeStr.includes("二月")) return 1;
    if (timeStr.includes("三月")) return 2;
    if (timeStr.includes("四月")) return 3;
    if (timeStr.includes("五月")) return 4;
    if (timeStr.includes("六月")) return 5;
    if (timeStr.includes("七月")) return 6;
    if (timeStr.includes("八月")) return 7;
    if (timeStr.includes("九月")) return 8;
    if (timeStr.includes("十月")) return 9;
    if (timeStr.includes("冬月")) return 10;
    if (timeStr.includes("腊月")) return 11;
    return -1;
}

function openModal(info) {
    currentFestId = String(info.id);  // 设置当前节日ID
    const modal = document.getElementById("fest-modal");
    document.getElementById("modal-img").src = info.img;
    document.getElementById("modal-name").innerText = info.name;
    const showTime = getShowTime(info.time);
    document.getElementById("modal-time").innerText = showTime;
    document.getElementById("modal-desc").innerText = info.desc;
    modal.style.display = "flex";
}


function getUrlParam(name) {
    let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    let r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}

window.addEventListener("DOMContentLoaded", function () {
    let targetNation = getUrlParam("nation");
    const nationSelect = document.getElementById("nationSelect");
    if (targetNation && nationSelect) {
        nationSelect.value = targetNation;
        filterFestivalByNation(targetNation);
    }
});

function getNowYear() {
    return new Date().getFullYear();
}

function parseLunarFromStr(timeStr) {
    const reg = /农历(\d+)月([一二三四五六七八九十]+[初一二三四五六七八九十])/;
    const res = timeStr.match(reg);
    if (!res) return null;
    const month = parseInt(res[1]);
    const dayMap = {
        "初一": 1, "初二": 2, "初三": 3, "初四": 4, "初五": 5, "初六": 6, "初七": 7, "初八": 8, "初九": 9, "初十": 10,
        "十一": 11, "十二": 12, "十三": 13, "十四": 14, "十五": 15, "十六": 16, "十七": 17, "十八": 18, "十九": 19, "二十": 20,
        "廿一": 21, "廿二": 22, "廿三": 23, "廿四": 24, "廿五": 25, "廿六": 26, "廿七": 27, "廿八": 28, "廿九": 29, "三十": 30
    };
    let dayText = res[2];
    if (dayText.includes("至")) {
        dayText = dayText.split("至")[0];
    }
    const day = dayMap[dayText];
    return { month, day };
}

function getShowTime(itemTime) {
    const lunarInfo = parseLunarFromStr(itemTime);
    if (!window.LunarLibReady || !lunarInfo) {
        if (itemTime.includes("水历") || itemTime.includes("伊斯兰历")) {
            return itemTime + "（民族历法，公历日期浮动）";
        }
        return itemTime;
    }
    const currYear = getNowYear();
    try {
        const lunar = Lunar.fromYmd(currYear, lunarInfo.month, lunarInfo.day);
        const solar = lunar.getSolar();
        const solarStr = `${solar.getYear()}-${String(solar.getMonth()).padStart(2, '0')}-${String(solar.getDay()).padStart(2, '0')}`;
        return `${itemTime}｜${currYear}年公历${solarStr}`;
    } catch (e) {
        return itemTime;
    }
}

// ===================== 用户中心数据渲染 =====================
function renderUserCenter() {
    const aiWrap = document.getElementById("ai-record-wrap");
    if (aiWrap) {
        let nowUser = JSON.parse(storage.getItem("nowUser") || "null");
        if (!nowUser || !nowUser.aiLog || nowUser.aiLog.length === 0) {
            aiWrap.innerHTML = '<p style="color:#999;padding:30px;text-align:center;">暂无AI生成记录，前往"风物叙录"体验民俗智能助手</p>';
        } else {
            aiWrap.innerHTML = nowUser.aiLog.slice().reverse().map((log, i) => `
                <div class="record-item" style="border:1px solid #e8e8e8;padding:14px;margin-bottom:12px;border-radius:8px;background:#fff;">
                    <div style="color:#999;font-size:12px;margin-bottom:8px;">${new Date(log.time || Date.now()).toLocaleString()}</div>
                    <div style="font-weight:bold;color:#7c2e2e;margin-bottom:6px;font-size:15px;">${log.title}</div>
                    <div style="color:#555;font-size:14px;line-height:1.6;white-space:pre-wrap;">${log.text}</div>
                    <button onclick="deleteAILog(${nowUser.aiLog.length - 1 - i})" style="margin-top:10px;padding:5px 14px;font-size:12px;border:1px solid #ddd;background:#fff;cursor:pointer;border-radius:4px;color:#666;">删除</button>
                </div>
            `).join('');
        }
    }

    const collectWrap = document.getElementById("collect-wrap");
    if (collectWrap) {
        let nowUser = JSON.parse(storage.getItem("nowUser") || "null");
        if (!nowUser || !nowUser.collect || nowUser.collect.length === 0) {
            collectWrap.innerHTML = '<p style="color:#999;padding:30px;text-align:center;">暂无收藏节日，在"时序历馆"点击节日卡片收藏</p>';
        } else {
            collectWrap.innerHTML = nowUser.collect.map(festName => {
                const fest = (typeof festData !== 'undefined' && festData.length > 0)
                    ? festData.find(f => f.name === festName)
                    : null;
                const isCraft = festName.startsWith("[非遗]");
                const displayName = isCraft ? festName.replace("[非遗]", "") : festName;
                const typeLabel = isCraft ? '<span style="color:#7c2e2e;font-size:12px;">[非遗项目]</span>' : '<span style="color:#4a7c59;font-size:12px;">[民族节日]</span>';
                return `
                    <div style="display:flex;align-items:center;padding:14px;border:1px solid #e8e8e8;margin-bottom:10px;border-radius:8px;background:#fff;">
                        <div style="flex:1;">
                            <div style="font-weight:bold;color:#333;font-size:15px;">${displayName}</div>
                            <div style="margin-top:4px;">${typeLabel}</div>
                            <div style="color:#666;font-size:13px;margin-top:4px;">${fest ? fest.time : ''}</div>
                        </div>
                        <button onclick="removeCollect('${festName}')" style="padding:6px 16px;font-size:13px;border:1px solid #7c2e2e;background:#fff;color:#7c2e2e;cursor:pointer;border-radius:4px;">取消收藏</button>
                    </div>
                `;
            }).join('');
        }
    }

    const remindWrap = document.getElementById("remind-wrap");
    if (remindWrap) {
        let nowUser = JSON.parse(storage.getItem("nowUser") || "null");
        if (!nowUser || !nowUser.remind || nowUser.remind.length === 0) {
            remindWrap.innerHTML = '<p style="color:#999;padding:30px;text-align:center;">暂无预约提醒</p>';
        } else {
            remindWrap.innerHTML = nowUser.remind.slice().reverse().map((r, i) => `
                <div style="padding:14px;border:1px solid #e8e8e8;margin-bottom:10px;border-radius:8px;background:#fff;">
                    <div style="font-weight:bold;color:#333;font-size:15px;">${r.name}</div>
                    <div style="color:#666;font-size:13px;margin-top:6px;">${r.time}</div>
                    <button onclick="removeRemind(${nowUser.remind.length - 1 - i})" style="margin-top:10px;padding:5px 14px;font-size:12px;border:1px solid #ddd;background:#fff;cursor:pointer;border-radius:4px;color:#666;">删除</button>
                </div>
            `).join('');
        }
    }
}

function deleteAILog(index) {
    let nowUser = JSON.parse(storage.getItem("nowUser") || "null");
    if (!nowUser) return;
    nowUser.aiLog.splice(index, 1);
    storage.setItem("nowUser", JSON.stringify(nowUser));
    let userList = JSON.parse(storage.getItem("userList") || "[]");
    let idx = userList.findIndex(u => u.name === nowUser.name);
    if (idx > -1) userList[idx] = nowUser;
    storage.setItem("userList", JSON.stringify(userList));
    renderUserCenter();
    countDataStat();
}

function removeCollect(festName) {
    let nowUser = JSON.parse(storage.getItem("nowUser") || "null");
    if (!nowUser) return;
    nowUser.collect = nowUser.collect.filter(c => c !== festName);
    storage.setItem("nowUser", JSON.stringify(nowUser));
    let userList = JSON.parse(storage.getItem("userList") || "[]");
    let idx = userList.findIndex(u => u.name === nowUser.name);
    if (idx > -1) userList[idx] = nowUser;
    storage.setItem("userList", JSON.stringify(userList));
    renderUserCenter();
    countDataStat();
}

function removeRemind(index) {
    let nowUser = JSON.parse(storage.getItem("nowUser") || "null");
    if (!nowUser) return;
    nowUser.remind.splice(index, 1);
    storage.setItem("nowUser", JSON.stringify(nowUser));
    let userList = JSON.parse(storage.getItem("userList") || "[]");
    let idx = userList.findIndex(u => u.name === nowUser.name);
    if (idx > -1) userList[idx] = nowUser;
    storage.setItem("userList", JSON.stringify(userList));
    renderUserCenter();
}

window.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("ai-record-wrap") || document.getElementById("collect-wrap")) {
        if (typeof festData !== 'undefined' && festData.length > 0) {
            renderUserCenter();
        } else {
            setTimeout(() => {
                renderUserCenter();
            }, 800);
        }
    }
});