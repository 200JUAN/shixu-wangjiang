from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
import smtplib
from email.mime.text import MIMEText
from email.utils import formataddr
import threading
import time
import json
import os
import re
import traceback
import schedule

app = Flask(__name__)
CORS(app)

# ====================== 仅此处填写16位QQ授权码，仅此一行 ======================
SMTP_SERVER = "smtp.qq.com"
SMTP_PORT = 465
SENDER_EMAIL = "2580387842@qq.com"
SENDER_PASSWORD = "sykadieycyiseahb"
DATA_FILE = "reminders.json"
# ===========================================================================

def load_data():
    if not os.path.exists(DATA_FILE):
        return {}
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_data(data):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# QQ官方标准合规发邮件函数，解决中文From 550报错，SSL 465端口
def send_email(to_email, subject, content):
    print(f"\n==================== 邮件发送日志 ====================")
    print(f"发件账号：{SENDER_EMAIL}")
    print(f"收件账号：{to_email}")
    if SENDER_PASSWORD == "粘贴你网页生成的16位授权码":
        print("[错误] 授权码未填写！")
        return False
    try:
        msg = MIMEText(content, "html", "utf-8")
        msg["Subject"] = subject
        # RFC标准编码中文发件人，QQ强制要求
        msg["From"] = formataddr(("时叙万疆", SENDER_EMAIL))
        msg["To"] = to_email
        # SSL加密465端口，腾讯官方推荐
        server = smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT)
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.sendmail(SENDER_EMAIL, [to_email], msg.as_string())
        server.quit()
        print(f"✅ 发送成功！")
        return True
    except Exception as err:
        print(f"❌ 发送失败：{err}")
        traceback.print_exc()
        return False

def parse_festival_date(time_str):
    year = datetime.now().year
    if "农历" in time_str:
        res = re.search(r"农历(\d+)月(\d+)", time_str)
        if res:
            lm = int(res.group(1))
            ld = int(res.group(2))
            from lunar_python import Lunar, Solar
            solar = Lunar(year, lm, ld).getSolar()
            return f"{solar.getYear()}-{str(solar.getMonth()).zfill(2)}-{str(solar.getDay()).zfill(2)}"
    res = re.search(r"公历(\d+)月(\d+)", time_str)
    if res:
        m = res.group(1).zfill(2)
        d = res.group(2).zfill(2)
        return f"{year}-{m}-{d}"
    return f"{year}-04-01"

def scan_task():
    print(f"\n========== {datetime.now()} 节日扫描启动 ==========")
    all_data = load_data()
    today = datetime.now()
    for username, user_info in all_data.items():
        mail = user_info.get("email", "")
        if not mail:
            continue
        remind_list = user_info.get("reminds", [])
        for item in remind_list:
            if item.get("sent"):
                continue
            try:
                fest_date_str = parse_festival_date(item["date"])
                fest_date = datetime.strptime(fest_date_str, "%Y-%m-%d")
                pre_days = int(item.get("remindDay", 7))
                trigger_day = fest_date - timedelta(days=pre_days)
                if today >= trigger_day:
                    html = f"""
                    <div style="max-width:600px;margin:0 auto;font-family:Microsoft Yahei;">
                        <div style="background:#8B3A3A;color:#fff;padding:20px;text-align:center;">
                            <h2>🎊 节日提醒</h2>
                        </div>
                        <div style="padding:30px;background:#f9f5f0;">
                            <p style="font-size:16px;">尊敬的 {username}，您好！</p>
                            <p style="font-size:18px;color:#8B3A3A;font-weight:bold;">{item['name']} 将在 {pre_days} 天后到来</p>
                            <div style="background:#fff;padding:20px;border-radius:8px;margin:20px 0;">
                                <p><strong>📅 举办时间：</strong>{item['date']}</p>
                                <p><strong>⏰ 提醒预设：</strong>{item.get('remindTime','09:00')}</p>
                            </div>
                            <p style="text-align:center;margin-top:30px;">
                                <a href="http://127.0.0.1:5500/calendar.html" style="background:#8B3A3A;color:#fff;padding:12px 30px;text-decoration:none;border-radius:4px;">查看完整节日</a>
                            </p>
                        </div>
                    </div>
                    """
                    send_email(mail, f"【时叙万疆】{item['name']} 节日提醒", html)
                    item["sent"] = True
                    item["sentTime"] = today.strftime("%Y-%m-%d %H:%M:%S")
            except Exception as e:
                print(f"节日 {item['name']} 异常：{e}")
    save_data(all_data)
    print("========== 扫描结束 ==========\n")

schedule.every().day.at("09:00").do(scan_task)

def schedule_loop():
    while True:
        schedule.run_pending()
        time.sleep(60)

# 纯连通测试接口（无需邮箱，单独验证前后端）
@app.route("/api/ping", methods=["POST"])
def ping_test():
    return jsonify({"status": "success", "msg": "前后端接口完全连通，无网络问题"})

# 新增节日提醒
@app.route("/api/remind", methods=["POST"])
def add_remind():
    req_data = request.json
    username = req_data.get("username")
    if not username:
        return jsonify({"status": "error", "message": "用户未登录"})
    all_data = load_data()
    if username not in all_data:
        all_data[username] = {"email": "", "reminds": []}
    new_item = {
        "id": str(req_data.get("id")),
        "name": req_data.get("name"),
        "date": req_data.get("date"),
        "remindDay": str(req_data.get("remindDay", 7)),
        "remindTime": str(req_data.get("remindTime", "09:00")),
        "note": req_data.get("note", ""),
        "sent": False,
        "createdAt": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    exists = any(i["id"] == new_item["id"] for i in all_data[username]["reminds"])
    if exists:
        return jsonify({"status": "error", "message": "该节日提醒已存在"})
    all_data[username]["reminds"].append(new_item)
    save_data(all_data)
    return jsonify({"status": "success", "message": "添加成功"})

# 获取用户全部提醒
@app.route("/api/reminds/<username>", methods=["GET"])
def get_all_reminds(username):
    all_data = load_data()
    user_info = all_data.get(username, {"reminds": []})
    return jsonify({"status": "success", "data": user_info["reminds"]})

# 修改提醒配置
@app.route("/api/remind/update", methods=["POST"])
def update_remind():
    req_data = request.json
    username = req_data.get("username")
    rid = req_data.get("id")
    new_day = req_data.get("remindDay")
    new_time = req_data.get("remindTime")
    all_data = load_data()
    if username not in all_data:
        return jsonify({"status": "error", "message": "用户不存在"})
    target = None
    for item in all_data[username]["reminds"]:
        if item["id"] == rid:
            target = item
            break
    if not target:
        return jsonify({"status": "error", "message": "提醒条目不存在"})
    target["remindDay"] = new_day
    target["remindTime"] = new_time
    target["sent"] = False
    save_data(all_data)
    return jsonify({"status": "success", "message": "修改完成"})

# 删除提醒
@app.route("/api/remind/<username>/<rid>", methods=["DELETE"])
def del_remind(username, rid):
    all_data = load_data()
    if username in all_data:
        all_data[username]["reminds"] = [i for i in all_data[username]["reminds"] if i["id"] != rid]
        save_data(all_data)
    return jsonify({"status": "success"})

# 保存用户接收邮箱
@app.route("/api/user/email", methods=["POST"])
def save_user_email():
    req_data = request.json
    username = req_data.get("username")
    mail = req_data.get("email")
    all_data = load_data()
    if username not in all_data:
        all_data[username] = {"reminds": []}
    all_data[username]["email"] = mail
    save_data(all_data)
    return jsonify({"status": "success", "message": "接收邮箱保存成功"})

# 邮件测试接口
@app.route("/api/test/email", methods=["POST"])
def test_email_api():
    req_data = request.json
    target_mail = req_data.get("email")
    if not target_mail:
        return jsonify({"status": "error", "message": "邮箱不能为空"})
    result = send_email(target_mail, "【时叙万疆】测试邮件", "<h3>测试成功！邮件服务正常</h3>")
    if result:
        return jsonify({"status": "success", "message": "测试邮件已发送，请查收"})
    else:
        return jsonify({"status": "error", "message": "发送失败，请查看后端控制台日志"})

if __name__ == "__main__":
    print("="*60)
    print("时叙万疆 节日定时邮件推送服务 启动")
    print(f"发件邮箱：{SENDER_EMAIL}")
    print("="*60)
    threading.Thread(target=schedule_loop, daemon=True).start()
    app.run(host="0.0.0.0", port=5000, debug=False)
