# -*- coding: utf-8 -*-
"""CDP: hook CSSStyleDeclaration.prototype.zIndex setter + cssText, reload, collect."""
import json, time, websocket

URL = 'ws://127.0.0.1:9222/devtools/page/B8DCBC87CEB29734618AD4CDE790D6C7'

HOOK = r"""
(function(){
  window.__ZLOG = [];
  function stack(){ try { return new Error().stack.split('\n').slice(2, 8).join(' <= '); } catch(e){ return 'nostack'; } }
  var d = Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype, 'zIndex');
  Object.defineProperty(CSSStyleDeclaration.prototype, 'zIndex', {
    set: function(v){
      var el = this.parentElement ? this : null;
      var info = 'ZSET(' + v + ') on <' + (this.parentElement ? this.parentElement.tagName + '.' + this.parentElement.className + '#' + this.parentElement.id : '?') + '>';
      if (window.__ZLOG.length < 60) window.__ZLOG.push(info + '\n  STACK ' + stack());
      return d.set.call(this, v);
    }, get: d.get, configurable: true
  });
  var d2 = Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype, 'cssText');
  Object.defineProperty(CSSStyleDeclaration.prototype, 'cssText', {
    set: function(v){
      var s = String(v);
      if (s.indexOf('z-index') >= 0 && window.__ZLOG.length < 60)
        window.__ZLOG.push('CSSTEXT(' + s.slice(0, 120) + ')\n  STACK ' + stack());
      return d2.set.call(this, v);
    }, get: d2.get, configurable: true
  });
})();
"""

def main():
    ws = websocket.create_connection(URL, timeout=40, suppress_origin=True)
    mid = [0]
    def send(method, params=None):
        mid[0] += 1
        ws.send(json.dumps({'id': mid[0], 'method': method, 'params': params or {}}))
        return mid[0]
    send('Page.enable')
    send('Page.addScriptToEvaluateOnNewDocument', {'source': HOOK})
    send('Page.reload')
    deadline = time.time() + 20
    while time.time() < deadline:
        try:
            ws.settimeout(2)
            json.loads(ws.recv())
        except websocket.WebSocketTimeoutException:
            pass
    # read log now (boot + mount done)
    send('Runtime.evaluate', {'expression': 'JSON.stringify({log: window.__ZLOG, ballZ: (document.querySelector(".rm-ball")||{}).style ? document.querySelector(".rm-ball").style.zIndex : "nobal"})', 'returnByValue': True})
    while True:
        msg = json.loads(ws.recv())
        if msg.get('id') == mid[0]:
            r = msg.get('result', {}).get('result', {})
            print('NO VALUE:' + json.dumps(msg)[:400] if 'value' not in r else r['value'])
            break
    # wait 15 more sec, read again (catch delayed zeroing e.g. on scene ready)
    time.sleep(15)
    send('Runtime.evaluate', {'expression': 'JSON.stringify(window.__ZLOG || [])', 'returnByValue': True})
    while True:
        msg = json.loads(ws.recv())
        if msg.get('id') == mid[0]:
            r = msg.get('result', {}).get('result', {})
            val = r.get('value')
            print('--- AFTER +15s ---')
            if isinstance(val, str):
                arr = json.loads(val)
                print('\n\n'.join(arr) if arr else 'EMPTY')
            else:
                print('RAW:', json.dumps(msg)[:400])
            break
    ws.close()

if __name__ == '__main__':
    main()
