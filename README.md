# tangmy 个人主页

静态个人介绍与作品导航。入口 index.html，样式 styles.css，assets/ 为真实页面截图。无构建依赖、分析追踪、博客或账号。

用户已确认视觉版本并授权提交替换主站。未核验的项目以不可点击状态显示，data-target 保存未来地址；启用时使用 target="_blank"、rel="noopener noreferrer" 并添加“新标签页打开”说明。

## 本地预览

在本目录运行 Windows PowerShell：

```powershell
python -m http.server 8138 --bind 127.0.0.1
```

浏览器访问 http://127.0.0.1:8138/ 。当前会话共享预览位于 http://127.0.0.1:8137/tangmy-home/ 。

## 恢复与迁移

原站提交 e2a2f6b47bf3360b4003df7bd985a8993a0907b9；同级 homepage-recovery/original-main.bundle 经 git bundle verify 检查可用，另存 index-original.html。旧 HTML SHA256：02D59AF2E6336D381329564EF99101569FE680DA3D698CFB7B6AD1A4254493F1。

原版游戏完整复制到同级 game-2048，HTML 哈希一致；公开仓库 myTangly/tangmy-2048 已上传提交 6d07d6c 并绑定 2048.tangmy.top。需要新增 2048 CNAME → mytangly.github.io。主站 DNS 不变。浏览器游戏最高分不跨域自动迁移。

## 复核记录

- 1440、768、390px DOM 测量无横向溢出；768 双列、390 单列，截图可见布局正确。
- 两张项目截图成功加载；页内导航可用，键盘 Tab 焦点可见。
- 原游戏方向键能产生新方块；本次未完成非零最高分保存验证，不宣称游戏全部交互已测试。
- 200% 缩放、系统减少动态和真实触屏手势尚待实测；CSS 已设置减少动态分支和模糊不支持时的白底回退。
- book 域名解析已生效，但 GitHub 证书仍为空，HTTPS 请求失败；2048 域名尚无解析。当前不启用作品外链。
- 发布前需核对链接 target/rel、HTTPS、隐私扫描及用户视觉确认。不要将本地预览等同上线。

本次替换前再次检查 1440/768/390px，无横向溢出、图片全部加载、页内导航正常且浏览器无 error 日志。作品域名仍未通过 HTTPS，因此保留不可点击状态。200% 缩放与真实触屏、系统减少动态设置仍未实测，不计为通过。原站提交保留，可通过恢复该提交内容进行回退，无须强制推送。
