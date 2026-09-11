export const projects = [
  {
    id: '2048', order: 1, category: '互动实验', title: '2048 互动实验',
    description: '粒子光影中的 2048，滑动方块，挑战更高分数。',
    url: 'https://2048.tangmy.top/', actionLabel: '打开 2048',
    image: { src: '/assets/2048-preview.jpg', width: 1440, height: 900, alt: '2048 真实页面：深色粒子背景与数字方块游戏' },
    presentation: 'portrait',
    status: { kind: 'notice', message: 'HTTPS 连接暂不可用，遇到安全警告请稍后访问。' }
  },
  {
    id: 'film', order: 2, category: '学习与创作', title: 'AI 微电影教材',
    description: '从创意到制作，记录我学习 AI 微电影的过程。',
    url: 'https://book.tangmy.top/', actionLabel: '阅读教材',
    image: { src: '/assets/book-preview.jpg', width: 1265, height: 712, alt: 'AI 微电影教材真实页面：章节导航与学习路线' },
    presentation: 'landscape'
  },
  {
    id: 'linux', order: 3, category: '系统学习', title: 'Linux 联合教程',
    description: '从 Windows 11 出发，循序掌握 Linux、WSL 2、Ubuntu、Docker Desktop 与 Codex。',
    url: 'https://linux.tangmy.top/', actionLabel: '学习 Linux',
    image: { src: '/assets/linux-learning-preview.png', width: 1440, height: 900, alt: 'Linux 联合教程真实页面：章节导航与学习路线' },
    presentation: 'landscape'
  }
].sort((a, b) => a.order - b.order);
