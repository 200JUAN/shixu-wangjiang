from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)  # 允许前端网页跨域访问

# 阿里云配置
DASHSCOPE_API_KEY = "sk-ws-H.RYLIMRY.AJOA.MEYCIQCQW3miIBzDnWDSx21s7U7MRTlwzH5LMbdhzFIBdPfXogIhAJ4JDmjnUMo1Ic6HWmF71IUwmssljjuNH4zxwZp3iMmo"
API_URL = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation"

# 你前端要调用的接口地址 /api/chat/query
@app.route("/api/chat/query", methods=["POST"])
def chat_query():
    data = request.get_json()
    user_text = data.get("userText", "")
    if not user_text:
        return jsonify({"code": 400, "msg": "输入内容不能为空"})

    # 发给阿里大模型
    headers = {
        "Authorization": f"Bearer {DASHSCOPE_API_KEY}",
        "Content-Type": "application/json"
    }
    body = {
        "model": "qwen-turbo",
        "input": {
            "messages": [
                {
                    "role": "system",
                    "content": "你是贵州少数民族民俗科普助手，仅解答贵州苗族、布依族、侗族、水族、瑶族等民族的节日、非遗、服饰、民俗相关知识；用户提问无关内容时，引导用户前往网站时序历馆、百族图谱板块查阅。回答简洁易懂。"
                },
                {"role": "user", "content": user_text}
            ]
        },
        "parameters": {"result_format": "message"}
    }

    resp = requests.post(API_URL, json=body, headers=headers)
    res_json = resp.json()

    if res_json.get("output") and res_json["output"]["choices"]:
        ai_answer = res_json["output"]["choices"][0]["message"]["content"]
        return jsonify({"code": 200, "data": ai_answer, "msg": "success"})
    else:
        return jsonify({"code": 500, "msg": "AI接口调用失败"})

if __name__ == "__main__":
    # 启动后端服务，端口5000
    app.run(host="127.0.0.1", port=5000, debug=True)
