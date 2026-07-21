// Agent debug helper — same-origin + ingest + in-memory for headless capture
export function agentLog(location, message, data, hypothesisId) {
    const entry = { sessionId: 'f25e99', location, message, data, hypothesisId, timestamp: Date.now() };
    if (typeof window !== 'undefined') {
        window.__dbgLog = window.__dbgLog || [];
        window.__dbgLog.push(entry);
    }
    const body = JSON.stringify(entry);
    fetch('http://127.0.0.1:7730/ingest/352ccf38-332a-4a24-9d98-e615247eaf63', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'f25e99' },
        body,
        keepalive: true
    }).catch(() => {});
    fetch('./debug-log.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'f25e99' },
        body,
        keepalive: true
    }).catch(() => {});
}
