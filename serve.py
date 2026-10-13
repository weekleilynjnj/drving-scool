# -*- coding: utf-8 -*-
"""
顺通驾校演示版 · 手机访问小服务
--------------------------------------------------
只用 Python 自带功能，不需要安装任何东西。
用法：双击同目录下的「启动手机访问.bat」
然后在手机浏览器里打开窗口里显示的地址。
"""
import functools
import http.server
import os
import socket
import sys
import urllib.parse
import webbrowser

try:
    sys.stdout.reconfigure(encoding="utf-8")   # 让中文在任何 Windows 终端都能正常显示
except Exception:
    pass

ROOT = os.path.dirname(os.path.abspath(__file__))
PORTS = [8080, 8081, 8082, 8090, 8000]


def lan_ip():
    """取本机在局域网里的 IP（手机要访问的就是这个地址）"""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        return s.getsockname()[0]
    except Exception:
        return "127.0.0.1"
    finally:
        s.close()


class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass                                  # 不刷访问日志，窗口保持清爽

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")   # 手机刷新就能看到最新改动
        super().end_headers()


def make_qr_page(url):
    """生成一个二维码页面，手机扫码就能直接打开"""
    qs = urllib.parse.quote(url, safe="")
    html = """<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8">
<title>扫码用手机打开</title>
<style>
body{font-family:"Microsoft YaHei",sans-serif;background:#eaf5ff;text-align:center;padding:36px}
h1{font-size:20px;color:#0d8be0;margin-bottom:6px}
p{color:#5a6b7c;font-size:14px;line-height:1.9}
img{background:#fff;padding:14px;border-radius:18px;box-shadow:0 10px 30px rgba(13,139,224,.2);margin:10px 0}
code{background:#fff;padding:6px 12px;border-radius:8px;font-size:15px;color:#22303f}
</style></head><body>
<h1>顺通驾校演示 · 手机打开</h1>
<p>用手机的「相机」或「微信扫一扫」扫下面的二维码</p>
<img src="https://api.qrserver.com/v1/create-qr-code/?size=260x260&amp;data=%s" width="260" height="260" alt="二维码">
<p>扫不了就直接在手机浏览器里输入：<br><code>%s</code></p>
<p style="color:#a9b7c4;font-size:12.5px">电脑和手机必须连同一个 WiFi（或手机开热点，电脑连热点）</p>
</body></html>""" % (qs, url)

    path = os.path.join(os.environ.get("TEMP", ROOT), "shuntong_qr.html")
    with open(path, "w", encoding="utf-8") as f:
        f.write(html)
    return path


def main():
    handler = functools.partial(Handler, directory=ROOT)
    httpd = None
    port = None
    for p in PORTS:
        try:
            httpd = http.server.ThreadingHTTPServer(("0.0.0.0", p), handler)
            port = p
            break
        except OSError:
            continue

    if httpd is None:
        print("端口都被占用了，请关掉其他程序后重试。")
        input("按回车退出...")
        return

    ip = lan_ip()
    url = "http://%s:%d/intro.html" % (ip, port)

    print("=" * 54)
    print("   顺通驾校演示 · 手机 / 平板访问服务已启动")
    print("=" * 54)
    print("   电脑 · 横屏介绍页: http://127.0.0.1:%d/intro.html" % port)
    print("   电脑 · 预约小程序: http://127.0.0.1:%d/index.html" % port)
    print("   手机 · 横屏介绍页: %s" % url)
    print("   手机 · 预约小程序: http://%s:%d/index.html" % (ip, port))
    print("   手机 · 管理后台  : http://%s:%d/admin.html  （仅驾校负责人，前台界面无入口）" % (ip, port))
    print("-" * 54)
    print("   ① 手机要和这台电脑连同一个 WiFi（或手机开热点，电脑连热点）")
    print("   ② 第一次运行若弹出防火墙提示，请点【允许访问】")
    print("   ③ 这个黑色窗口关掉，手机就打不开了")
    print("=" * 54)
    sys.stdout.flush()                     # 立即显示上面的地址，不等缓冲

    try:
        webbrowser.open(make_qr_page(url))
    except Exception:
        pass

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n已停止服务。")
    finally:
        httpd.server_close()


if __name__ == "__main__":
    main()
