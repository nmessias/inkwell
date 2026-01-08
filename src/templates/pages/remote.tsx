export function RemotePage({
  token,
  wsUrl,
}: {
  token: string;
  wsUrl: string;
}): JSX.Element {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, maximum-scale=1.0" />
        <title>Remote Control - Tome</title>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          html, body {
            height: 100%;
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: #1a1a1a;
            color: #fff;
            touch-action: manipulation;
            -webkit-user-select: none;
            user-select: none;
          }
          .container {
            display: flex;
            flex-direction: column;
            height: 100%;
          }
          .controls {
            flex: 1;
            display: flex;
          }
          .tap-zone {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 48px;
            cursor: pointer;
            transition: background-color 0.1s;
          }
          .tap-zone:active {
            background-color: rgba(255, 255, 255, 0.2);
          }
          .tap-zone.disabled {
            opacity: 0.3;
            pointer-events: none;
          }
          .tap-left {
            background: #2d2d2d;
            border-right: 1px solid #444;
          }
          .tap-right {
            background: #2d2d2d;
          }
          .tap-left:active { background: #3d5a3d; }
          .tap-right:active { background: #3d5a3d; }
          .status-bar {
            padding: 16px;
            background: #111;
            border-top: 1px solid #333;
            text-align: center;
          }
          .status-indicator {
            display: inline-block;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            margin-right: 8px;
          }
          .status-indicator.connected { background: #4caf50; }
          .status-indicator.disconnected { background: #f44336; }
          .status-indicator.connecting { background: #ff9800; }
          .status-text {
            font-size: 14px;
            color: #aaa;
          }
          .flash {
            animation: flash 0.15s ease-out;
          }
          @keyframes flash {
            0% { background-color: rgba(76, 175, 80, 0.5); }
            100% { background-color: transparent; }
          }
        `}</style>
      </head>
      <body>
        <div class="container">
          <div class="controls">
            <div class="tap-zone tap-left disabled" id="prev">
              <span>←</span>
            </div>
            <div class="tap-zone tap-right disabled" id="next">
              <span>→</span>
            </div>
          </div>
          <div class="status-bar">
            <span class="status-indicator connecting" id="indicator"></span>
            <span class="status-text" id="status">Connecting...</span>
          </div>
        </div>

        <script>{`
(function() {
  var wsUrl = '${wsUrl}';
  var prevBtn = document.getElementById('prev');
  var nextBtn = document.getElementById('next');
  var indicator = document.getElementById('indicator');
  var statusText = document.getElementById('status');
  var ws = null;
  var connected = false;

  function setStatus(state, text) {
    indicator.className = 'status-indicator ' + state;
    statusText.textContent = text;
    
    var disabled = state !== 'connected';
    prevBtn.classList.toggle('disabled', disabled);
    nextBtn.classList.toggle('disabled', disabled);
    connected = !disabled;
  }

  function flash(el) {
    el.classList.remove('flash');
    void el.offsetWidth;
    el.classList.add('flash');
  }

  function send(action) {
    if (!connected || !ws) return;
    try {
      ws.send(JSON.stringify({ action: action }));
      flash(action === 'prev' ? prevBtn : nextBtn);
    } catch (e) {}
  }

  function connect() {
    setStatus('connecting', 'Connecting...');
    
    try {
      ws = new WebSocket(wsUrl);
    } catch (e) {
      setStatus('disconnected', 'Connection failed');
      setTimeout(connect, 3000);
      return;
    }

    ws.onopen = function() {
      setStatus('connected', 'Connected');
    };

    ws.onmessage = function(e) {
      try {
        var data = JSON.parse(e.data);
        if (data.type === 'connected') {
          setStatus('connected', 'Connected');
        }
      } catch (err) {}
    };

    ws.onerror = function() {
      setStatus('disconnected', 'Connection error');
    };

    ws.onclose = function() {
      setStatus('disconnected', 'Disconnected - Reconnecting...');
      ws = null;
      setTimeout(connect, 2000);
    };
  }

  prevBtn.onclick = function() { send('prev'); };
  nextBtn.onclick = function() { send('next'); };

  connect();
})();
        `}</script>
      </body>
    </html>
  );
}
