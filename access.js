/* ===================================================================
   access.js —— 功能门禁（新增文件）
   -------------------------------------------------------------------
   规则：浏览器本地没有「报名成功」记录时，
        「预约练车」和「驾考题库」两个功能锁定、不可使用。
        只要「我的报名」里至少有 1 条记录，两个功能立刻自动解锁。
   说明：本文件不改动 app.js / style.css 里的任何原有逻辑，
        只在页面加载后做「加锁 / 解锁」的额外处理。
   =================================================================== */
var GATE_KEY = 'signups';

/* 是否已经报名成功：本地有至少 1 条报名记录 */
function hasSignup() {
  try {
    var raw = localStorage.getItem(GATE_KEY);
    var data = raw ? JSON.parse(raw) : [];            // JSON.parse(...) || []
    return Array.isArray(data) && data.length > 0;    // 兜底：不是数组就当没报名
  } catch (e) {
    return false;                                     // 读不到就当没报名
  }
}

/* 点被锁功能时的提示 + 引导去报名 */
function lockTip(what) {
  var msg = '请先完成报名，才能使用' + (what || '该功能');
  if (typeof window.showToast === 'function') {
    window.showToast(msg);
  } else {
    alert(msg);
  }
  setTimeout(function () { location.href = 'signup.html'; }, 1000);
}

/* 给一个入口加锁：变灰 + 挂锁图标 + 点击拦截 */
function lockEntry(el, what) {
  if (!el || el.getAttribute('data-locked') === '1') { return; }
  el.setAttribute('data-locked', '1');
  el.classList.add('is-locked');

  var p = el.querySelector('p');
  if (p) {
    p.textContent = '完成报名后解锁';
    p.classList.add('lock-hint');
  }

  // 覆盖原来的点击行为（链接的 href 和 onclick 都会被拦下）
  el.onclick = function (e) {
    if (e) {
      if (e.preventDefault) { e.preventDefault(); }
      if (e.stopPropagation) { e.stopPropagation(); }
    }
    lockTip(what);
    return false;
  };
}

/* 执行门禁 */
function applyGate() {
  try {
    if (hasSignup()) { return; }                      // 已报名 → 全部功能正常

    // 1) 锁定所有「预约练车」入口（指向 booking.html 的链接）
    var links = document.querySelectorAll('a[href$="booking.html"]');
    for (var i = 0; i < links.length; i++) {
      lockEntry(links[i], '预约练车');
    }

    // 2) 锁定「驾考题库」入口（onclick 里调用 go('exam') 的元素）
    var exams = document.querySelectorAll('[onclick*="exam"]');
    for (var j = 0; j < exams.length; j++) {
      lockEntry(exams[j], '驾考题库');
    }

    // 3) 兜底：万一还有别处直接调用 go('exam')，也一并拦下
    if (typeof window.go === 'function' && !window.__gateGoWrapped) {
      var _go = window.go;
      window.go = function (type) {
        if (type === 'exam') { lockTip('驾考题库'); return; }
        return _go(type);
      };
      window.__gateGoWrapped = true;
    }
  } catch (e) { /* 门禁出错不影响页面本身 */ }
}

/* 页面加载后执行一次 */
applyGate();

/* 从报名页返回本页（含浏览器后退、BFCache 恢复）时，重新判断一次：
   如果这时已经报名成功，但页面还是锁着，就自动刷新解锁 */
window.addEventListener('pageshow', function () {
  try {
    if (hasSignup() && document.querySelector('.is-locked')) {
      location.reload();
    }
  } catch (e) { /* 忽略 */ }
});
