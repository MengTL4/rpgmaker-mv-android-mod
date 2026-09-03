# -*- coding: utf-8 -*-
"""CDP: inject a cssText/setAttribute hook before page scripts run, reload, collect writes."""
import json, time, websocket, sys

URL = 'ws://127.0.0.1:9222/devtools/page/B8DCBC87CEB29734618AD4CDE790D6C7'

HOOK = r"""
(function(){
  window.__CSSLOG = [];
  function stack(){ try { return new Error().stack.split('\n').slice(2, 7).join(' <= '); } catch(e){ return 'nostack'; } }
  var d = Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype, 'cssText');
  Object.defineProperty(CSSStyleDeclaration.prototype, 'cssText', {
    set: function(v){
      var s = String(v);
      if (s.indexOf('z-index') >= 0 && window.__CSSLOG.length < 40)
        window.__CSSLOG.push('CSSTEXT: ' + s.slice(0, 180) + '\n  STACK ' + stack());
      return d.set.call(this, v);
    }, get: d.get, configurable: true
  });
  var sa = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function(name, val){
    if (name === 'style' && String(val).indexOf('z-index') >= 0 && window.__CSSLOG.length < 40)
      window.__CSSLOG.push('SETATTR: ' + String(val).slice(0, 180) + '\n  STACK ' + stack());
    return sa.call(this, name, val);
  };
  var sp = CSSStyleDeclaration.prototype.setProperty;
  CSSStyleDeclaration.prototype.setProperty = function(name, val, prio){
    if (name === 'z-index' && window.__CSSLOG.length < 40)
      window.__CSSLOG.push('SETPROP: ' + name + '=' + val + '\n  STACK ' + stack());
    return sp.call(this, name, val, prio);
  };
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
    send('Runtime.enable')
    send('Page.addScriptToEvaluateOnNewDocument', {'source': HOOK})
    send('Page.reload')
    deadline = time.time() + 30
    seen = set()
    while time.time() < deadline:
        try:
            ws.settimeout(max(1, deadline - time.time()))
            msg = json.loads(ws.recv())
        except websocket.WebSocketTimeoutException:
            break
        if msg.get('method') == 'Page.loadEventFired':
            pass
        if msg.get('id') and msg['id'] == 3:
            pass
        # poll for __CSSLOG a few times after load
    # evaluate: read collected log (rmmod mounts after game classes ready; wait a bit)
    time.sleep(15)
    send('Runtime.evaluate', {'expression': 'JSON.stringify(window.__CSSLOG || "no log")',
                              'returnByValue': True, 'awaitPromise': False})
    while True:
        msg = json.loads(ws.recv())
        if msg.get('id') == mid[0]:
            r = msg.get('result', {}).get('result', {})
            val = r.get('value')
            if isinstance(val, str):
                arr = json.loads(val)
                if isinstance(arr, list):
                    print('\n\n'.join(arr) if arr else 'EMPTY LOG')
                else:
                    print(val)
            else:
                print('RAW:', json.dumps(msg, ensure_ascii=False)[:600])
            break
    ws.close()

if __name__ == '__main__':
    main()
