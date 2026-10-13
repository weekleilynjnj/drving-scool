// ===== 提示弹窗（CSS 淡入淡出，替代生硬的 alert） =====
var toastTimer;
function showToast(msg) {
  var t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('show');
  void t.offsetWidth;        // 强制重排，让动画能重复播放
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { t.classList.remove('show'); }, 1900);
}

// ===== 页面切换 =====
function switchTab(name) {
  document.querySelectorAll('.page').forEach(function (p) {
    p.classList.remove('active');
  });
  document.querySelectorAll('.tab').forEach(function (t) {
    t.classList.remove('active');
  });
  document.getElementById('page-' + name).classList.add('active');
  var tab = document.getElementById('tab-' + name);
  if (tab) tab.classList.add('active'); // 教练/场地/预约页没有底部按钮，跳过
  if (name === 'mine') {                // 进入「我的」时刷新两个列表
    renderSignups();
    renderBookings();
  }
}

// 点击首页大板块，进入对应页面
function go(type) {
  switchTab(type);
}

// ===== 我的报名（signup.html 提交的记录，同一个浏览器本地存储） =====
var SIGNUP_KEY = 'signups';

function getSignups() {
  try {
    var data = JSON.parse(localStorage.getItem(SIGNUP_KEY) || '[]');   // JSON.parse(...) || []
    return Array.isArray(data) ? data : [];                           // 不是数组也兜底成空数组
  } catch (e) {
    return [];
  }
}

function saveSignups(list) {
  try {
    localStorage.setItem(SIGNUP_KEY, JSON.stringify(list));
  } catch (e) { /* 忽略 */ }
}

function renderSignups() {
  var box = document.getElementById('signup-list');
  if (!box) return;
  var list = getSignups();

  if (list.length === 0) {
    box.innerHTML = '<div class="card"><p>还没有报名记录，去首页点「我要报名」试试</p></div>';
    return;
  }

  box.innerHTML = list.map(function (o, i) {
    return '<div class="card">' +
      '<h4>' + o.name + '　<span class="tag warn">' + (o.status || '待联系') + '</span></h4>' +
      '<p>意向班型：' + o.plan + '</p>' +
      '<p>' + o.phone + ' ｜ ' + o.time + '</p>' +
      '<p>备注：' + (o.remark || '无') + '</p>' +
      '<button class="btn small" onclick="delSignup(' + i + ')">删除报名</button>' +
      '</div>';
  }).join('');
}

function delSignup(i) {
  if (!confirm('确定要删除这条报名记录吗？')) return;
  var list = getSignups();
  list.splice(i, 1);
  saveSignups(list);
  renderSignups();
  showToast('已删除报名记录');
}

// ===== 我的预约（booking.html 三步流程提交的订单，按状态分组展示） =====
var BOOKING_KEY = 'bookings';

function getBookings() {
  try {
    var data = JSON.parse(localStorage.getItem(BOOKING_KEY) || '[]');  // JSON.parse(...) || []
    return Array.isArray(data) ? data : [];                            // 不是数组也兜底成空数组
  } catch (e) {
    return [];                                                         // 存储被禁用 / 数据损坏 → 空数组
  }
}

function saveBookings(list) {
  try { localStorage.setItem(BOOKING_KEY, JSON.stringify(list)); } catch (e) { /* 忽略 */ }
}

function renderBookings() {
  var box = document.getElementById('booking-list');
  if (!box) return;
  var list = getBookings();

  if (list.length === 0) {
    box.innerHTML = '<div class="card"><p>还没有预约，去首页点「预约练车」试试</p></div>';
    return;
  }

  // 三种状态：待确认(黄) / 已确认(绿) / 已取消(红)
  var groups = [
    { name: '待确认', cls: 'warn' },
    { name: '已确认', cls: 'ok' },
    { name: '已取消', cls: 'danger' }
  ];

  var html = '';
  groups.forEach(function (g) {
    var arr = list.filter(function (o) { return (o.status || '待确认') === g.name; });
    if (arr.length === 0) return;

    html += '<div class="card"><h4>' + g.name +
            '　<span class="tag ' + g.cls + '">' + arr.length + ' 条</span></h4>';

    arr.forEach(function (o) {
      var pending = (o.status || '待确认') === '待确认';
      html += '<div class="bk">' +
        '<div class="bk-line"><b>' + o.date + '　' + o.time + '</b>' +
        '<span class="tag ' + g.cls + '">' + (o.status || '待确认') + '</span></div>' +
        '<p>' + o.coach + ' 教练 ｜ ' + (o.field || '总校场地') + '</p>' +
        '<div class="bk-act">' +
          '<a class="bk-link" href="booking-detail.html?id=' + encodeURIComponent(o.id) + '">查看详情 ›</a>' +
          (pending ? '<button class="btn small" onclick="cancelBooking(\'' + o.id + '\')">取消预约</button>' : '') +
        '</div></div>';
    });
    html += '</div>';
  });

  box.innerHTML = html;
}

function cancelBooking(id) {
  if (!confirm('确定要取消这条预约吗？')) return;
  var list = getBookings();
  for (var i = 0; i < list.length; i++) {
    if (String(list[i].id) === String(id)) { list[i].status = '已取消'; break; }
  }
  saveBookings(list);
  renderBookings();
  showToast('已取消预约');
}

// 打开页面时先渲染一次
renderSignups();
renderBookings();

// 支持 index.html#mine 直接打开「我的」页（报名成功页会用到）
if (location.hash === '#mine') switchTab('mine');
