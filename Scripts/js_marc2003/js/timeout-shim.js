var g_trace_timer = false;
function setInterval(func, wait){
    var id = window.SetInterval(func, wait);
    g_trace_timer && fb.trace("setInterval",id);
    return id;
}
function clearInterval(id) {
    g_trace_timer && fb.trace("clearInterval",id);
    window.ClearInterval(id);
}
function setTimeout(func, wait){
    var id = window.SetTimeout(func, wait);
    g_trace_timer && fb.trace("setTimeout",id);
    return id;
}
function clearTimeout(id) {
    g_trace_timer && fb.trace("clearTimeout",id);
    window.ClearTimeout(id);
}
