# -*- coding: utf-8 -*-
"""零依赖 CDP Runtime.evaluate。用法: python cdp_eval_min.py "<js>" [port]
单次连接评估并打印 JSON 结果，避免依赖 websocket-client。"""
import sys, json, base64, os, socket, ssl, urllib.request, struct

PORT = sys.argv[2] if len(sys.argv) > 2 else "9222"
EXPR = sys.argv[1]

# 1) 找 page 的 webSocketDebuggerUrl
with urllib.request.urlopen(f"http://127.0.0.1:{PORT}/json/list", timeout=5) as r:
    pages = json.load(r)
url = None
for p in pages:
    if p.get("type") == "page":
        url = p.get("webSocketDebuggerUrl")
        break
if not url:
    print("NO_PAGE"); sys.exit(1)
host, rest = url.split("://", 1)
host = host.replace("http", "").replace("ws", "")
path = "/" + rest.split("/", 1)[1] if "/" in rest else "/"
# url 形如 ws://127.0.0.1:9222/devtools/page/<id>

def ws_connect(hostport, path):
    h, p = hostport.split(":")
    s = socket.create_connection((h, int(p)), timeout=8)
    key = base64.b64encode(os.urandom(16)).decode()
    req = (f"GET {path} HTTP/1.1\r\nHost: {h}:{p}\r\nUpgrade: websocket\r\n"
           f"Connection: Upgrade\r\nSec-WebSocket-Key: {key}\r\n"
           f"Sec-WebSocket-Version: 13\r\n\r\n")
    s.sendall(req.encode())
    # 读应答头
    buf = b""
    while b"\r\n\r\n" not in buf:
        buf += s.recv(1)
    return s

hostport = url.split("://", 1)[1]
hostport = hostport.split("/")[0]
s = ws_connect(hostport, path)

def send_frame(sock, text):
    payload = text.encode()
    mask = os.urandom(4)
    header = bytearray()
    header.append(0x81)  # FIN + text
    ln = len(payload)
    if ln < 126:
        header.append(0x80 | ln)
    elif ln < 65536:
        header.append(0x80 | 126); header.extend(struct.pack(">H", ln))
    else:
        header.append(0x80 | 127); header.extend(struct.pack(">Q", ln))
    header.extend(mask)
    masked = bytes(b ^ mask[i % 4] for i, b in enumerate(payload))
    sock.sendall(bytes(header) + masked)

def recv_frame(sock):
    b = sock.recv(2)
    if not b: return ""
    ln = b[1] & 0x7F
    if ln == 126: ln = struct.unpack(">H", sock.recv(2))[0]
    elif ln == 127: ln = struct.unpack(">Q", sock.recv(8))[0]
    data = b""
    while len(data) < ln:
        chunk = sock.recv(ln - len(data))
        if not chunk: break
        data += chunk
    return data.decode("utf-8", "replace")

msg = {"id": 1, "method": "Runtime.evaluate",
       "params": {"expression": EXPR, "returnByValue": True, "awaitPromise": True}}
send_frame(s, json.dumps(msg))
# 读若干帧直至拿到 id==1 的响应
for _ in range(10):
    t = recv_frame(s)
    if not t: break
    try:
        j = json.loads(t)
    except Exception:
        continue
    if j.get("id") == 1:
        res = j.get("result", {}).get("result", {})
        print(json.dumps(res.get("value", res), ensure_ascii=False))
        break
else:
    print("NO_RESPONSE")
s.close()
