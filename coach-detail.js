/* ===================================================================
   coach-detail.js —— 「教练详情页」独立脚本
   不依赖任何框架，不改动 app.js / style.css
   读取数据一律带兜底：|| {}  || []  和 try/catch，防止白屏
   =================================================================== */

/* ---------- 教练数据（id 与教练列表页卡片一一对应） ---------- */
var COACHES = {
  1: {
    name: '张建国', avatar: 'avatar-1', years: 10, subject: '科目二、科目三',
    score: 4.9, students: 320,
    chips: ['一人一车', '从不吼人', '通过率 98%', '可约周末'],
    intro: '2005 年入行，教龄 10 年，累计带出 320 名学员。擅长把倒车入库、坡道定点拆成几个固定点位，新手也能一遍看懂；脾气好、不催不吼，学员一次性通过率长期保持在 98% 以上。',
    reviews: [
      { nick: '王同学', star: 5, text: '教练特别耐心，倒车入库讲得非常细，每个点位都带着我走一遍，第一次考就过了。' },
      { nick: '刘女士', star: 5, text: '晚上八点还能约到车，不用请假扣工资，对我们上班族太友好了。' },
      { nick: '陈先生', star: 4, text: '点位教得很清楚，就是话有点多，不过看得出来很负责。' }
    ]
  },
  2: {
    name: '李 伟', avatar: 'avatar-2', years: 7, subject: '科目二',
    score: 4.8, students: 210,
    chips: ['侧方停车专长', '录像复盘', '零基础友好'],
    intro: '教龄 7 年，主攻科目二，尤其擅长侧方停车与直角转弯。喜欢用手机拍下每一次练习的轨迹，回去再帮你逐段复盘，所以进步通常比别人快一截。',
    reviews: [
      { nick: '赵同学', star: 5, text: '每次练完都告诉我哪儿压线了，改起来特别快，两周就找到感觉了。' },
      { nick: '孙女士', star: 5, text: '很细心，会提前提醒我考试容易踩的坑，考场上少走了很多弯路。' },
      { nick: '周先生', star: 4, text: '教学没得说，就是周末约车要提前一两天。' }
    ]
  },
  3: {
    name: '王 强', avatar: 'avatar-3', years: 12, subject: '科目三',
    score: 4.9, students: 480,
    chips: ['路考老教练', '三条路线全熟', '安全意识强', '带考经验丰富'],
    intro: '教龄 12 年，科目三路考老教练，熟悉本市三条考试路线的每一个路口和易扣分点。坚持带学员上真实路况练车，重点培养观察习惯和安全意识。',
    reviews: [
      { nick: '吴同学', star: 5, text: '三条考试路线带我跑了好几遍，考试的时候几乎没紧张，一把过。' },
      { nick: '郑先生', star: 5, text: '讲安全讲得特别细，拿了证也敢自己一个人上路。' },
      { nick: '冯女士', star: 5, text: '老教练就是稳，考前把细节全给我捋了一遍。' }
    ]
  },
  4: {
    name: '刘 洋', avatar: 'avatar-4', years: 6, subject: '科目二',
    score: 4.7, students: 180,
    chips: ['年轻教练', '沟通轻松', '录像复盘', '免费加练'],
    intro: '教龄 6 年，年轻教练，沟通起来没什么压力，特别擅长带零基础学员。教学过程会录小视频发给你，回家也能自己复盘一遍。',
    reviews: [
      { nick: '何同学', star: 5, text: '我完全零基础，教练讲得特别通俗，两次就能把车稳住了。' },
      { nick: '曹女士', star: 4, text: '人很随和，约车也方便，练车不紧张。' },
      { nick: '许先生', star: 5, text: '录的小视频很有用，回家看看就知道自己哪儿不对。' }
    ]
  },
  5: {
    name: '赵 磊', avatar: 'avatar-5', years: 9, subject: '科目三',
    score: 4.8, students: 260,
    chips: ['考前模拟', '心态辅导', '细节控'],
    intro: '教龄 9 年，科目三教练，注重细节和心态调整。每次考前都会专门安排一次模拟考试，把容易扣分的项目从头过一遍。',
    reviews: [
      { nick: '邓同学', star: 5, text: '考前那一场模拟太有用了，考试当天心里特别有底。' },
      { nick: '蒋女士', star: 5, text: '很会缓解紧张，全程不催不吼，练车体验很好。' },
      { nick: '韩先生', star: 4, text: '教学很专业，就是场地离我家稍远一点。' }
    ]
  },
  6: {
    name: '孙 浩', avatar: 'avatar-6', years: 5, subject: '科目二、科目三',
    score: 4.7, students: 150,
    chips: ['口诀教学', '耐心', '科二科三都能带'],
    intro: '教龄 5 年，科目二、科目三都能带，年轻有耐心。擅长把复杂动作拆成简单口诀，同一批学员里通过率一直排在前面。',
    reviews: [
      { nick: '杨同学', star: 5, text: '口诀特别好记，练两次就找到感觉了。' },
      { nick: '朱女士', star: 5, text: '特别有耐心，从来不嫌我问得多。' },
      { nick: '秦先生', star: 4, text: '整体都不错，就是周末约车的人比较多。' }
    ]
  }
};

/* ---------- 本地存储安全读取（全部带兜底） ---------- */
var BOOKING_KEY = 'bookings';

function readBookings() {
  try {
    var raw = localStorage.getItem(BOOKING_KEY);
    var data = raw ? JSON.parse(raw) : [];        // JSON.parse(...) || []
    return Array.isArray(data) ? data : [];       // 不是数组也兜底成空数组
  } catch (e) {
    return [];
  }
}

/* ---------- 小工具 ---------- */
function $(id) { return document.getElementById(id); }

function getId() {
  try {
    var m = location.search.match(/[?&]id=(\d+)/);
    return m ? m[1] : '';
  } catch (e) {
    return '';
  }
}

/* 星星：满 5 颗，score 四舍五入 */
function stars(score) {
  var n = Math.round(Number(score) || 5);
  if (n > 5) { n = 5; }
  if (n < 0) { n = 0; }
  var s = '';
  for (var i = 1; i <= 5; i++) { s += (i <= n ? '★' : '☆'); }
  return s;
}

/* 昵称取第一个字做头像 */
function faceChar(nick) {
  var s = String(nick || '学');
  return s.charAt(0);
}

/* ---------- 渲染页面 ---------- */
function render() {
  var root = $('cd-root');
  if (!root) { return; }

  var id = getId();
  var c = COACHES[id] || {};                       // ← 兜底：取不到就是空对象，不会报错

  if (!c.name) {                                   // 数据不存在时给友好页面，绝不白屏
    root.innerHTML =
      '<div class="cd-404">' +
        '<div class="big">🔍</div>' +
        '<h2>没有找到这位教练</h2>' +
        '<p>链接可能不完整，请从教练团队重新进入</p>' +
      '</div>' +
      '<a class="cd-book btn" href="index.html">返回首页看教练团队</a>';
    return;
  }

  var reviews = c.reviews || [];                   // ← 兜底成空数组
  var chips = c.chips || [];

  // 这位教练在本机已有的预约条数（安全读取，读不到就是 0）
  var all = readBookings() || [];
  var mine = 0;
  for (var i = 0; i < all.length; i++) {
    if (all[i] && all[i].coach === c.name) { mine++; }
  }

  var html =
    // 顶部名片
    '<div class="cd-head">' +
      '<div class="photo cd-avatar ' + (c.avatar || 'avatar-1') + '"></div>' +
      '<h2>' + c.name + ' 教练</h2>' +
      '<div class="cd-meta">教龄 ' + (c.years || '-') + ' 年 ｜ 擅长 ' + (c.subject || '-') + ' ｜ 已带学员 ' + (c.students || 0) + ' 人</div>' +
      '<div class="cd-stars">' + stars(c.score) + '<b>' + (c.score || '-') + ' 分</b></div>' +
    '</div>' +

    // 简介
    '<div class="card">' +
      '<h4>教练简介</h4>' +
      '<p class="cd-intro">' + (c.intro || '这位教练还没有填写简介。') + '</p>' +
      '<div class="cd-chips">' +
        chips.map(function (t) { return '<span class="cd-chip">' + t + '</span>'; }).join('') +
      '</div>' +
      '<div class="cd-count">📌 这台设备上已有 <b>' + mine + '</b> 条预约是这位教练</div>' +
    '</div>' +

    // 学员评价
    '<h4 class="list-title">学员评价（' + reviews.length + ' 条）</h4>' +
    '<div class="card">' +
      (reviews.length === 0
        ? '<p class="cd-intro">这位教练还没有学员评价。</p>'
        : reviews.map(function (r, k) {
            var o = r || {};                       // ← 兜底：单条评价缺失也不会崩
            return '<div class="rv">' +
              '<div class="rv-face c' + ((k % 3) + 1) + '">' + faceChar(o.nick) + '</div>' +
              '<div class="rv-body">' +
                '<div class="rv-top"><b>' + (o.nick || '匿名学员') + '</b>' +
                '<span class="rv-star">' + stars(o.star || 5) + '</span></div>' +
                '<p>' + (o.text || '这位学员没有留下文字评价。') + '</p>' +
              '</div></div>';
          }).join('')) +
    '</div>' +

    // 底部大按钮
    '<a class="btn cd-book" id="cd-book" href="booking.html">立即预约该教练</a>' +
    '<p class="tip" style="text-align:center;margin-top:12px">点按钮进入预约页，选教练那一步请选择「' + c.name + '」</p>';

  root.innerHTML = html;

  // 点按钮时记一下这位教练（预约页若读取预设可自动选中；读不到也不影响跳转）
  var btn = $('cd-book');
  if (btn) {
    btn.addEventListener('click', function () {
      try { localStorage.setItem('presetCoach', c.name); } catch (e) { /* 忽略 */ }
    });
  }
}

/* ---------- 初始化：任何异常都给友好提示，不白屏 ---------- */
try {
  render();
} catch (e) {
  var root = $('cd-root');
  if (root) {
    root.innerHTML =
      '<div class="cd-404">' +
        '<div class="big">⚠️</div>' +
        '<h2>页面加载出错了</h2>' +
        '<p>请返回首页重新进入教练团队</p>' +
      '</div>' +
      '<a class="cd-book btn" href="index.html">返回首页</a>';
  }
}
