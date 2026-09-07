# 小裴围棋课室官网 · Xiao Pei Weiqi Website

纯静态网站（HTML + CSS + JS，无数据库、无后端），中英双语（右上角按钮切换）。

**此分支（`design/gpt-academy-style`）说明**：这版设计由 ChatGPT/Codex 基于本仓库其他分支的素材重新搭建，用户从其预览页面导出 `.mhtml` 文件后由 Claude 解析还原为可独立部署的静态文件。原始导出不含 JavaScript（浏览器"保存网页"不会保留脚本）和图标 sprite 文件，语言切换、移动端菜单、首页轮播、课堂照片跑马灯暂停、微信号一键复制等交互逻辑（`assets/js/main.js`）、九路试玩棋盘逻辑（`assets/js/goban.js`）与图标文件（`assets/img/icons.svg`）均为重建，已通过本地功能测试验证一致。

## 目录结构

```
index.html              网站主页面（唯一页面，所有内容都在这里）
assets/css/style.css    样式
assets/js/main.js       语言切换 / 移动端导航菜单 / 首页轮播 / 跑马灯暂停 / 微信号复制
assets/js/goban.js       试玩棋盘（九路围棋，含提子与打劫判断）
assets/img/icons.svg    图标 sprite
CNAME                   GitHub Pages 绑定自定义域名用，内容是 peigoacademy.com
```

## 本地预览

不需要安装任何东西，用浏览器直接打开 `index.html` 即可；或者如果装了 Python：

```bash
python3 -m http.server 8080
# 浏览器打开 http://localhost:8080
```

## 上线步骤（域名 `peigoacademy.com` 已购买，托管免费）

### 方案 A：GitHub Pages（最简单，和这个仓库直接绑定）

1. 仓库 Settings → Pages → Source 选 `design/gpt-academy-style` 分支的根目录。
2. GitHub 会自动识别仓库里的 `CNAME` 文件，绑定 `peigoacademy.com`。
3. 在域名的 DNS 设置里添加（若 DNS 托管在 Cloudflare，就在 Cloudflare 的"域名 → DNS → Records"里添加）：
   - 4 条 `A` 记录（Name 留空 / `@`）指向 GitHub Pages 的 IP：
     `185.199.108.153` `185.199.109.153` `185.199.110.153` `185.199.111.153`
   - 一条 `CNAME` 记录：`www` 指向 `<你的GitHub用户名>.github.io`
   - 如果用 Cloudflare 做 DNS，这几条记录的代理状态（橙色云朵）建议先关掉（改成"仅 DNS"/灰色云朵），避免和 GitHub Pages 的证书校验冲突。
4. 等待 DNS 生效（几分钟到几小时），在 Pages 设置里勾选 "Enforce HTTPS"。

**Cloudflare 侧曾提示"添加了域名，等待验证"**：那是 Cloudflare Pages/Registrar 独立的域名接入流程，跟这里说的 GitHub Pages 方案不是一回事。如果决定走 GitHub Pages，只需要按上面第 3 步在 Cloudflare 的 DNS 记录页面加那 4 条 A 记录和 1 条 CNAME 记录即可，不需要走 Cloudflare Pages 的"连接项目"流程。

### 方案 B：Cloudflare Pages（速度更快，新加坡访问友好，也免费）

1. Cloudflare Dashboard → Workers & Pages → 创建项目 → 连接这个 GitHub 仓库，选择 `design/gpt-academy-style` 分支。
2. Build 设置留空（纯静态站点不需要构建命令）。
3. 部署完成后，在项目的 Custom domains 里添加 `peigoacademy.com`，按提示添加 DNS 记录（如果域名本身就托管在 Cloudflare，会自动配置）。

两种方案都不需要服务器、不需要数据库，网站本身完全免费托管，唯一的持续成本就是每年续费域名。

## 后续可选增强（不影响当前上线）

- 用 Cloudflare Email Routing（免费）配置 `hello@peigoacademy.com` 转发到常用邮箱。
- 如果之后想要"预约试听"表单自动收集，可以用 Cloudflare Pages Functions 或第三方表单服务（如 Tally、Jotform）嵌入，不需要自己写后端。
