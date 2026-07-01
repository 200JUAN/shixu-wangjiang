// js/ai-float-init.js
// 全局悬浮窗口 - 插入到任何页面
(function() {
    // 如果已存在，不再插入
    if (document.getElementById('aiFloatWin')) return;

    // CSS 样式
    const css = `
        .float-open-btn {
            position: fixed;
            right: 30px;
            bottom: 30px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: #9c1a2c;
            color: #fff;
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 16px rgba(156, 26, 44, 0.4);
            z-index: 999;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            gap: 2px;
            font-size: 12px;
        }
        .float-open-btn:hover { 
            transform: scale(1.1); 
            box-shadow: 0 6px 20px rgba(156, 26, 44, 0.5);
        }
        .ai-float-window {
            position: fixed;
            width: 380px;
            height: 500px;
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.15);
            display: flex;
            flex-direction: column;
            z-index: 1000;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease, visibility 0.3s ease;
            /* 初始位置 */
            right: 30px;
            bottom: 100px;
            left: auto;
            top: auto;
        }
        .ai-float-window.active {
            opacity: 1;
            visibility: visible;
        }
        .float-drag-bar {
            background: #9c1a2c;
            color: #fff;
            padding: 12px 16px;
            border-radius: 12px 12px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: move;
            user-select: none;
            -webkit-user-select: none;
        }
        .float-btn-group {
            display: flex;
            gap: 4px;
        }
        .float-btn-group span {
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            cursor: pointer;
            transition: background 0.2s;
        }
        .float-btn-group span:hover {
            background: rgba(255,255,255,0.2);
        }
        .float-chat-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        .float-chat-box {
            flex: 1;
            overflow-y: auto;
            padding: 12px;
            background: #fafafa;
        }
        .float-input-area {
            padding: 12px;
            border-top: 1px solid #e8e8e8;
            display: flex;
            gap: 8px;
            background: #fff;
            border-radius: 0 0 12px 12px;
            align-items: center;
        }
        .float-input-area input {
            flex: 1;
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 6px;
            outline: none;
            font-size: 13px;
        }
        .float-input-area button {
            padding: 8px 16px;
            background: #9c1a2c;
            color: #fff;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
        }
        .float-voice-btn {
            background: #f0f0f0;
            color: #666;
            width: 32px;
            height: 32px;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            border: 1px solid #ddd;
            cursor: pointer;
            transition: all 0.3s;
            flex-shrink: 0;
        }
        .float-voice-btn:hover {
            background: #e0e0e0;
        }
        .float-voice-btn.recording {
            background: #ff4444;
            color: white;
            animation: floatPulse 1.5s infinite;
        }
        @keyframes floatPulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        .float-voice-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        .chat-msg {
            margin-bottom: 12px;
            padding: 10px 14px;
            border-radius: 8px;
            max-width: 80%;
            word-wrap: break-word;
            line-height: 1.5;
        }
        .msg-user {
            background: #9c1a2c;
            color: #fff;
            margin-left: auto;
            border-bottom-right-radius: 2px;
        }
        .msg-bot {
            background: #fff;
            color: #333;
            border: 1px solid #e8e8e8;
            border-bottom-left-radius: 2px;
        }
    `;
    
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    // HTML 结构
    const html = `
        <button id="openFloatWinBtn" class="float-open-btn">
            <i class="fas fa-comment-dots" style="font-size:22px;"></i>
            <span>AI助手</span>
        </button>
        <div id="aiFloatWin" class="ai-float-window">
            <div id="aiDragBar" class="float-drag-bar">
                <span><i class="fas fa-robot"></i> AI民族助手</span>
                <div class="float-btn-group">
                    <span id="aiMinBtn"><i class="fas fa-minus"></i></span>
                    <span id="aiCloseBtn"><i class="fas fa-times"></i></span>
                </div>
            </div>
            <div class="float-chat-content">
                <div id="floatChatBox" class="float-chat-box"></div>
                <div class="float-input-area">
                    <input type="text" id="floatInput" placeholder="输入问题...">
                    <button id="floatVoiceBtn" class="float-voice-btn" title="语音输入">
                        <i class="fas fa-microphone"></i>
                    </button>
                    <button id="floatSendBtn">发送</button>
                </div>
            </div>
        </div>
    `;
    
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);

    // JS 逻辑
    const STORAGE_KEY = 'ai_nation_chat_history';
    const WIN_STATUS_KEY = 'ai_float_window_status';
    const POS_KEY = 'ai_float_position';
    const PROXY_API = "https://guizhouai-proxy-stsixnhyev.cn-hangzhou.fcapp.run/api/ai-chat";
    
    let chatHistory = [];
    
    const floatWin = document.getElementById('aiFloatWin');
    const openBtn = document.getElementById('openFloatWinBtn');
    const closeBtn = document.getElementById('aiCloseBtn');
    const minBtn = document.getElementById('aiMinBtn');
    const dragBar = document.getElementById('aiDragBar');
    const chatBox = document.getElementById('floatChatBox');
    const input = document.getElementById('floatInput');
    const sendBtn = document.getElementById('floatSendBtn');
    const voiceBtn = document.getElementById('floatVoiceBtn');

    function init() {
        const status = localStorage.getItem(WIN_STATUS_KEY);
        if (status === 'open') {
            floatWin.classList.add('active');
            // 恢复位置
            const savedPos = localStorage.getItem(POS_KEY);
            if (savedPos) {
                try {
                    const pos = JSON.parse(savedPos);
                    setPosition(pos.x, pos.y);
                } catch(e) {}
            }
        }
        
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try { chatHistory = JSON.parse(saved); } catch(e) {}
        }
        if (chatHistory.length === 0) {
            chatHistory.push({sender:'bot', text:'你好！我是AI民族助手，可咨询贵州民族节日、非遗知识~'});
        }
        render();
    }

    // 定位窗口，清空right/bottom避免冲突
    function setPosition(x, y) {
        floatWin.style.right = '';
        floatWin.style.bottom = '';
        floatWin.style.left = x + 'px';
        floatWin.style.top = y + 'px';
    }

    function getPosition() {
        const rect = floatWin.getBoundingClientRect();
        return { x: rect.left, y: rect.top };
    }

    function save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(chatHistory));
    }

    function saveStatus(isOpen) {
        localStorage.setItem(WIN_STATUS_KEY, isOpen ? 'open' : 'close');
    }

    function render() {
        chatBox.innerHTML = '';
        chatHistory.forEach(item => {
            const div = document.createElement('div');
            div.className = 'chat-msg ' + (item.sender === 'user' ? 'msg-user' : 'msg-bot');
            div.textContent = item.text;
            chatBox.appendChild(div);
        });
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function pushMsg(text, isUser) {
        chatHistory.push({sender: isUser ? 'user' : 'bot', text});
        save();
        render();
    }

    // 全局挂载，给全屏AI页面同步消息
    window.pushMsg = pushMsg;

    // 打开悬浮窗
    openBtn.addEventListener('click', () => {
        floatWin.classList.add('active');
        saveStatus(true);
    });

    // 最小化
    minBtn.addEventListener('click', () => {
        floatWin.classList.remove('active');
        saveStatus(false);
    });

    // 关闭
    closeBtn.addEventListener('click', () => {
        floatWin.classList.remove('active');
        saveStatus(false);
    });

    // 稳定拖拽逻辑
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;

    dragBar.addEventListener('mousedown', function(e) {
        if (e.button !== 0) return;
        isDragging = true;
        const rect = floatWin.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;
        startX = e.clientX;
        startY = e.clientY;

        floatWin.style.right = '';
        floatWin.style.bottom = '';
        floatWin.style.left = initialLeft + 'px';
        floatWin.style.top = initialTop + 'px';
        floatWin.style.transition = 'none';

        e.preventDefault();
        e.stopPropagation();
    });

    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        let newLeft = initialLeft + dx;
        let newTop = initialTop + dy;

        const winW = floatWin.offsetWidth;
        const winH = floatWin.offsetHeight;
        const margin = 10;
        newLeft = Math.max(margin, Math.min(newLeft, window.innerWidth - winW - margin));
        newTop = Math.max(margin, Math.min(newTop, window.innerHeight - winH - margin));

        floatWin.style.left = newLeft + 'px';
        floatWin.style.top = newTop + 'px';
    });

    document.addEventListener('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            const rect = floatWin.getBoundingClientRect();
            localStorage.setItem(POS_KEY, JSON.stringify({
                x: rect.left,
                y: rect.top
            }));
            floatWin.style.transition = 'opacity 0.3s ease, visibility 0.3s ease';
        }
    });

    dragBar.addEventListener('selectstart', e => e.preventDefault());

    // 发送消息
    sendBtn.addEventListener('click', async () => {
        const text = input.value.trim();
        if (!text) return;
        pushMsg(text, true);
        input.value = '';
        
        try {
            const res = await fetch(PROXY_API, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({prompt: text})
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            pushMsg(data.answer, false);
        } catch(err) {
            pushMsg('调用异常：' + err.message, false);
        }
    });

    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') sendBtn.click();
    });

    // 语音识别
    var recognition = null;
    var isRecording = false;

    if (window.webkitSpeechRecognition || window.SpeechRecognition) {
        var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.lang = "zh-CN";
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = function (event) {
            var voiceText = event.results[0][0].transcript;
            input.value = voiceText;
            console.log('悬浮窗语音识别结果：', voiceText);
        };

        recognition.onerror = function () {
            stopRecording();
        };

        recognition.onend = function () {
            stopRecording();
        };

        function startRecording() {
            isRecording = true;
            voiceBtn.classList.add('recording');
            voiceBtn.innerHTML = '<i class="fas fa-stop"></i>';
            voiceBtn.title = "点击结束录音";
            recognition.start();
        }

        function stopRecording() {
            isRecording = false;
            voiceBtn.classList.remove('recording');
            voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            voiceBtn.title = "点击开始录音";
            recognition.stop();
        }

        voiceBtn.addEventListener('click', () => {
            if (!isRecording) {
                startRecording();
            } else {
                stopRecording();
            }
        });
    } else {
        voiceBtn.disabled = true;
        voiceBtn.title = "当前浏览器不支持语音转文字";
        voiceBtn.style.opacity = "0.5";
    }

    init();
})();