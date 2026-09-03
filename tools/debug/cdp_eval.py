# -*- coding: utf-8 -*-
"""CDP Runtime.evaluate helper: run JS in the game WebView and print the result."""
import sys, json, websocket, urllib.request

CDP_HTTP = 'http://127.0.0.1:9222/json'
CDP_PORT = None  # 可被 argv[2] 覆盖

def get_ws_url():
    http = CDP_HTTP
    if len(sys.argv) > 2:
        http = 'http://127.0.0.1:%s/json' % sys.argv[2]
    targets = json.loads(urllib.request.urlopen(http).read().decode())
    pages = [t for t in targets if t.get('type') == 'page']
    if not pages:
        raise SystemExit('no page targets: ' + json.dumps(targets)[:300])
    return pages[0]['webSocketDebuggerUrl']

def main():
    expr = sys.argv[1] if len(sys.argv) > 1 else 'document.title'
    ws = websocket.create_connection(get_ws_url(), timeout=15, suppress_origin=True)
    ws.send(json.dumps({'id': 1, 'method': 'Runtime.evaluate',
                        'params': {'expression': expr, 'returnByValue': True,
                                   'awaitPromise': True}}))
    while True:
        msg = json.loads(ws.recv())
        if msg.get('id') == 1:
            res = msg.get('result', {})
            if 'exceptionDetails' in res:
                print('EXCEPTION:', json.dumps(res['exceptionDetails'], ensure_ascii=False)[:800])
            r = res.get('result', {})
            if 'value' in r:
                v = r['value']
                print(v if isinstance(v, str) else json.dumps(v, ensure_ascii=False, indent=1))
            else:
                print('NO VALUE:', json.dumps(msg, ensure_ascii=False)[:500])
            break
    ws.close()

if __name__ == '__main__':
    main()
