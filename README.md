# Tangmy · 个人空间

你好，我是 Tangmy，一个逐渐学习使用 AI 的大学生。

这里汇集我的学习项目，以及我觉得好用的工具。

## 访问网站

- [个人主页](https://tangmy.top/)
- [2048 互动实验](https://2048.tangmy.top/)：闲着没事让AI乱搓的2048数字方块游戏。
- [AI 微电影教材](https://book.tangmy.top/)：全程AI自己没看过的从创意到制作的学习记录与教材。
- [Linux 联合教程](https://linux.tangmy.top/)：面向新手的 Linux、WSL 2、Ubuntu、Docker Desktop 与 Codex 联合学习路线。

## 关于本站

网站使用静态 HTML、CSS 与原生 JavaScript，采用蓝白磨砂玻璃风格，适配桌面、平板和手机。不设置账号、留言或访问分析追踪。

项目与工具列表会随学习过程逐步更新；收录不代表所有内容均由我原创。

## 双页结构与本地预览

中央地球贴图：`assets/earth-blue-marble.png`（1024×512），来自 [NASA Blue Marble](https://svs.gsfc.nasa.gov/2915/)。Credit: NASA/Goddard Space Flight Center Scientific Visualization Studio; Reto Stockli (NASA/GSFC) and NASA's Earth Observatory。遵循 [NASA 媒体使用说明](https://www.nasa.gov/nasa-brand-center/images-and-media/)，不表示 NASA 对本站的认可。贴图本地托管，仅启用 3D 时加载。

首页展示可拖动、可选择的 Three.js 星图，`/projects/` 提供真实截图展廊与完整项目目录；子站仍独立维护。主站使用 GitHub Pages，从 `master` 分支根目录发布，保留 `CNAME` 指定的自定义域名。

安装 Node.js 后，在仓库目录运行 `node scripts/serve.cjs`，打开 `http://127.0.0.1:4173/`。ES Modules 需要 HTTP 服务，不能通过直接双击 HTML 验证。此命令不部署网站。

- `scripts/projects.js`：共享项目数据；新增项目时添加数据与真实截图，并同步两个 HTML 文件中的无脚本备用链接。
- `scripts/home.js`、`scripts/star-map.js`：首页选择器与独立 WebGL 场景。
- `scripts/gallery.js`、`scripts/shared.js`：展廊与共享轮换、可访问性控制。
- `styles.css`：两页共享视觉 token 和响应式样式。

Three.js 固定为 r186（0.186.0），本地文件位于 `assets/vendor/three/`，采用同目录 MIT 许可。`three.module.min.js` 与压缩核心共约 790 KiB；核心命名为 `three.core.js` 以匹配官方导入路径。来源为 npm `three@0.186.0` 的 build 文件；运行时不请求 CDN、外部字体或模型。

减少动态、节省流量或 WebGL 失败时不加载或停用 3D，保留 CSS 背景与 HTML 项目入口。粗指针或窄屏降低粒子与像素比；页面隐藏或星图离开视口时停止绘制。首页每 8 秒轮换，手动操作后暂停 12 秒；项目页每 5 秒轮换，显示进度与倒计时，悬停卡片时暂停、移开后继续。手动暂停、键盘焦点与减少动态设置优先于自动轮换。

验收应覆盖 1440/768/390px、200% 缩放、键盘与触屏、减少动态、脚本和 WebGL 失败。项目状态提示是检查时的快照，发布前须重新核验 HTTPS；不以本地预览成功代表公网可用。
