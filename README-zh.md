# majsoul-monthTicket-auto

> 警告：使用本项目所产生的任何不利影响、账号处罚或其他后果，均由使用者自行承担责任。

![image](https://github.com/4n3u/majsoul-monthTicket-auto/assets/167657823/89844790-9a47-40b7-8e65-ed07430f3917)
![image](https://github.com/4n3u/majsoul-monthTicket-auto/assets/167657823/720689fa-7237-4d85-8979-c3e768c7f1d9)

本项目通过 GitHub Actions 自动登录雀魂，帮助完成每日出勤成就（8bit 立直 BGM）并领取每日福气御守。  

## 前置准备
1. 在浏览器中打开雀魂。
2. 按 `F12` 打开开发者工具，并切换到 `Console` 选项卡。
3. 执行以下代码：
   ```js
   console.log(`UID: ${GameMgr.Inst.yostar_uid}\nTOKEN: ${GameMgr.Inst.yostar_accessToken}`);
   ```
4. 记录输出的 `UID` 和 `TOKEN`，用于 JP/EN/KR 服务器配置。
5. 如果使用 CN 服务器，则准备好账号邮箱和密码。所需的密码哈希会由脚本内部自动计算。

## 配置步骤
1. 在 GitHub 上 Fork 本仓库。
2. 在 Fork 后的仓库中打开 `Settings > Secrets and variables > Actions`。
3. 点击 `New repository secret`，添加 `MS_SERVER`。
4. `MS_SERVER` 的值填写 `jp`、`en`、`kr`、`cn` 之一。不填写时默认使用 `jp`。
5. 如果使用 `jp`、`en` 或 `kr` 服务器，请再次点击 `New repository secret`，添加 `UID` 和 `TOKEN`。
6. 如果使用 `cn` 服务器，请再次点击 `New repository secret`，添加 `EMAIL` 和 `PASSWORD`，值填写账号邮箱和明文密码。
7. 前往 `Settings > Actions > General`，将 `Workflow permissions` 调整为 `Read and write permissions`。
8. 默认执行时间为每天 JST 6:05。若需修改，请编辑 `.github/workflows/main.yml` 中的 `cron`。
9. 打开仓库顶部的 `Actions` 标签页，点击 `I understand my workflows, go ahead and enable them` 启用工作流。
10. 在左侧 `Workflows` 列表选择 `Login to Majsoul`，点击 `Enable workflow`。

## 测试方法
1. 确保浏览器中已经登录雀魂。
2. 在 GitHub 的 `Actions > Workflows` 页面点击 `Run workflow` 手动触发。
3. 如果运行正常，浏览器端可能会因为重复登录而被服务器强制下线。

## 注意事项
- GitHub Actions 可能因为服务器负载最多延迟 30 分钟。
- 请妥善保管 `token` 和 `uid`，避免泄露。

## 联系方式
- [Discord](https://discord.com/users/245702966085025802)
- [X](https://x.com/xflVsSnvB6cx8ZM)
