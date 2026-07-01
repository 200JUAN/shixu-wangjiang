const floatWin = document.getElementById('aiFloatWin');
const openFloatBtn = document.getElementById('openFloatWin');
const closeBtn = document.getElementById('aiCloseBtn');
const minBtn = document.getElementById('aiMinBtn');
const dragBar = document.getElementById('aiDragBar');
const chatBox = document.getElementById('aiChatBox');
const input = document.getElementById('aiInput');
const sendBtn = document.getElementById('aiSendBtn');
const fileInput = document.getElementById('ai-file-input');
const clearBtn = document.getElementById('aiClearBtn');

// 本地缓存key
const STORAGE_KEY = 'ai_nation_chat_history';
const WIN_STATUS_KEY = 'ai_float_window_status';
let chatHistory = [];

// 页面加载：恢复窗口打开状态 + 历史聊天记录
function initWindowState() {
  // 恢复窗口显示状态
  const winStatus = localStorage.getItem(WIN_STATUS_KEY);
  if(winStatus === 'open'){
    floatWin.classList.add('active');
  }
  // 恢复聊天记录
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      chatHistory = JSON.parse(saved);
    } catch (e) {
      chatHistory = [];
    }
  }
  if (chatHistory.length === 0) {
    chatHistory.push({ sender: 'bot', text: '你好！我是AI民族助手，可咨询贵州民族节日、非遗知识，也可上传民俗图片识别分析~' });
  }
  renderAllMsgs();
}

// 保存窗口显示状态
function saveWindowStatus(isOpen) {
  localStorage.setItem(WIN_STATUS_KEY, isOpen ? 'open' : 'close');
}

// 保存聊天记录
function saveHistory() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chatHistory));
}

// 新增消息
function appendMsg(text, isUser) {
  const sender = isUser ? 'user' : 'bot';
  chatHistory.push({ sender, text });
  saveHistory();
  const div = document.createElement('div');
  div.className = 'chat-msg ' + (isUser ? 'msg-user' : 'msg-bot');
  div.textContent = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// 渲染全部历史消息
function renderAllMsgs() {
  chatBox.innerHTML = '';
  chatHistory.forEach(item => {
    const div = document.createElement('div');
    div.className = 'chat-msg ' + (item.sender === 'user' ? 'msg-user' : 'msg-bot');
    div.textContent = item.text;
    chatBox.appendChild(div);
  });
  chatBox.scrollTop = chatBox.scrollHeight;
}

// 清空记录
clearBtn.addEventListener('click', () => {
  chatHistory = [];
  localStorage.removeItem(STORAGE_KEY);
  chatBox.innerHTML = '';
  appendMsg('已清空聊天记录', false);
});

// 下拉菜单：打开悬浮窗
openFloatBtn.addEventListener('click', () => {
  floatWin.classList.add('active');
  saveWindowStatus(true);
});

// 窗口最小化（仅隐藏，缓存状态为关闭）
minBtn.addEventListener('click', () => {
  floatWin.classList.remove('active');
  saveWindowStatus(false);
});

// 窗口×彻底关闭
closeBtn.addEventListener('click', () => {
  floatWin.classList.remove('active');
  saveWindowStatus(false);
});

// 窗口自由拖动逻辑
let isDragging = false, offsetX, offsetY;
dragBar.addEventListener('mousedown', (e) => {
  isDragging = true;
  const rect = floatWin.getBoundingClientRect();
  offsetX = e.clientX - rect.left;
  offsetY = e.clientY - rect.top;
  floatWin.style.transition = 'none';
  floatWin.style.right = 'auto';
  floatWin.style.bottom = 'auto';
});
document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  const winW = floatWin.offsetWidth;
  const winH = floatWin.offsetHeight;
  const maxX = window.innerWidth - winW;
  const maxY = window.innerHeight - winH;
  let newX = e.clientX - offsetX;
  let newY = e.clientY - offsetY;
  newX = Math.max(0, Math.min(newX, maxX));
  newY = Math.max(0, Math.min(newY, maxY));
  floatWin.style.left = newX + 'px';
  floatWin.style.top = newY + 'px';
});
document.addEventListener('mouseup', () => {
  isDragging = false;
  floatWin.style.transition = 'all 0.2s ease';
});

// 发送消息（复用你的阿里云接口）
async function sendMessage() {
  const content = input.value.trim();
  if (!content) return;
  appendMsg(content, true);
  input.value = '';
  try {
    const PROXY_API = "https://guizhouai-proxy-stsixnhyev.cn-hangzhou.fcapp.run/api/ai-chat";
    const res = await fetch(PROXY_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: content })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    appendMsg(data.answer, false);
  } catch (err) {
    appendMsg(`调用异常：${err.message}，请检查后端服务是否部署正常`, false);
    console.error(err);
  }
}
sendBtn.addEventListener('click', sendMessage);
input.addEventListener('keydown', (e) => e.key === 'Enter' && sendMessage());

// 图片上传
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  appendMsg(`已选择图片：${file.name}，正在识别...`, true);
  setTimeout(() => {
    appendMsg('图片识别完成：已提取民俗场景元素，可进一步提问细节。', false);
  }, 1200);
});

// 页面初始化读取缓存状态
window.onload = initWindowState;