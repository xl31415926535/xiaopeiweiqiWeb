# 小裴围棋课室官网 · Xiao Pei Weiqi Website

纯静态网站（HTML + CSS + JS，无数据库、无后端），中英双语（右上角按钮切换）。

## 目录结构

```
index.html              网站主页面（唯一页面，所有内容都在这里）
assets/css/style.css    样式
assets/js/main.js       语言切换 / 移动端导航菜单
assets/img/favicon.svg  网站图标
CNAME                   GitHub Pages 绑定自定义域名用，内容是 xiaopeiweiqi.com
```

## 待办：替换真实联系方式

打开 `index.html`，搜索关键字 `[WhatsApp` 和 `[微信号`，把下面两处占位符替换成真实信息：

```html
<a class="contact-card" href="https://wa.me/6500000000" ...>
  <span class="contact-value">[WhatsApp 号码待补充 / number to be added]</span>
</a>
...
<span class="contact-value">[微信号待补充 / WeChat ID to be added]</span>
```

- `href="https://wa.me/6500000000"` 里的号码也要改成真实号码（国际格式，不带 `+` 和空格，例如新加坡号码 `65` 开头）。
- 页面顶部导航栏的"免费试听"按钮会自动滚动到联系方式区块，不用改。

## 本地预览

不需要安装任何东西，用浏览器直接打开 `index.html` 即可；或者如果装了 Python：

```bash
python3 -m http.server 8080
# 浏览器打开 http://localhost:8080
```

## 上线步骤（成本：域名一年约 $10–20，托管免费）

### 第一步：买域名

去 Namecheap / GoDaddy / Cloudflare Registrar 等注册商搜索并购买 `xiaopeiweiqi.com`（如果被占用，可以考虑 `.sg` 或 `xiaopeiweiqiweiqi.com` 等备选）。

### 第二步：选一个免费静态托管，二选一即可

**方案 A：GitHub Pages（最简单，和这个仓库直接绑定）**

1. 把这个仓库 push 到 GitHub（这一步已经在做）。
2. 仓库 Settings → Pages → Source 选这个分支 / `main` 分支的根目录。
3. GitHub 会自动识别仓库里的 `CNAME` 文件，绑定 `xiaopeiweiqi.com`。
4. 去域名注册商的 DNS 设置里添加：
   - 4 条 `A` 记录指向 GitHub Pages 的 IP：
     `185.199.108.153` `185.199.109.153` `185.199.110.153` `185.199.111.153`
   - 一条 `CNAME` 记录：`www` 指向 `<你的GitHub用户名>.github.io`
5. 等待 DNS 生效（几分钟到几小时），在 Pages 设置里勾选 "Enforce HTTPS"。

**方案 B：Cloudflare Pages（速度更快，新加坡访问友好，也免费）**

1. Cloudflare Dashboard → Workers & Pages → 创建项目 → 连接这个 GitHub 仓库。
2. Build 设置留空（纯静态站点不需要构建命令）。
3. 部署完成后，在项目的 Custom domains 里添加 `xiaopeiweiqi.com`，按提示添加 DNS 记录（如果域名本身就托管在 Cloudflare，会自动配置）。

两种方案都不需要服务器、不需要数据库，网站本身完全免费托管，唯一的持续成本就是每年续费域名。

## 后续可选增强（不影响当前上线）

- 加一个真实的教室 / 学生 / 荣誉证书照片（注意肖像权，建议先获得学生家长同意）。
- 用 Cloudflare Email Routing（免费）配置 `hello@xiaopeiweiqi.com` 转发到常用邮箱。
- 如果之后想要"预约试听"表单自动收集，可以用 Cloudflare Pages Functions 或第三方表单服务（如 Tally、Jotform）嵌入，不需要自己写后端。
