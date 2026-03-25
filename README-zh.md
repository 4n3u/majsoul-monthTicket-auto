# majsoul-monthTicket-auto

> 警告：使用本项目所产生的任何不利影响、账号处罚或其他后果，均由使用者自行承担责任。

![image](https://github.com/4n3u/majsoul-monthTicket-auto/assets/167657823/89844790-9a47-40b7-8e65-ed07430f3917)
![image](https://github.com/4n3u/majsoul-monthTicket-auto/assets/167657823/720689fa-7237-4d85-8979-c3e768c7f1d9)

本项目通过 GitHub Actions 自动登录雀魂，帮助完成每日出勤成就（8bit 立直 BGM）并领取每日福气御守。  
<br/>
## 前置准备

1. 在浏览器中打开雀魂并登录。
2. 按 `F12` 打开开发者工具，切换到 `Network` 选项卡。
3. 搜索 `login`，找到 xhr 或 fetch 请求。
4. 在请求数据中记录 `token` 和 `uid`。
<br/><br/>
## 配置步骤

1. 在 GitHub 上 Fork 本仓库。
2. 在 Fork 后的仓库中打开 `Settings > Secrets and variables > Actions`。
3. 点击 `New repository secret`，使用名称 `UID` 保存记录的 `uid`。
4. 同样创建名称为 `TOKEN` 的 Secret，保存记录的 `token`。
5. 前往 `Settings > Actions > General`，将 `Workflow permissions` 调整为 `Read and write permissions`。
6. 默认服务器为 JP。如果要切换 EN 服务器，请在仓库 Secret（或本地环境变量）中设置 `MS_HOST=https://mahjongsoul.game.yo-star.com/`。
7. 默认执行时间为每天韩国时间 6:05。若需修改，请编辑 `.github/workflows/main.yml` 中的 `cron`。
8. 打开仓库顶部的 `Actions` 标签页，点击 `I understand my workflows, go ahead and enable them` 启用工作流。
9. 在左侧 `Workflows` 列表选择 `Login to Majsoul`，点击 `Enable workflow`。
<br/><br/>
## 测试方法

1. 确保浏览器中已经登陆雀魂。
2. 在 GitHub 的 `Actions > Workflows` 页面点击 `Run workflow` 手动触发。
3. 运行成功后会导致双端登录，浏览器会被服务器强制下线。
<br/><br/>
## 注意事项

- GitHub Actions 可能因为服务器负载最多延迟 30 分钟。
- 请妥善保管 `token` 和 `uid`，避免泄露。
