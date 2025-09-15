# majsoul-monthTicket-auto
![image](https://github.com/4n3u/majsoul-monthTicket-auto/assets/167657823/89844790-9a47-40b7-8e65-ed07430f3917)
![image](https://github.com/4n3u/majsoul-monthTicket-auto/assets/167657823/720689fa-7237-4d85-8979-c3e768c7f1d9)

![](https://dcbadge.limes.pink/api/shield/245702966085025802?compact=true)

本项目使用 GitHub Actions 自动化雀魂每日登录，实现签到成就（8bit立直BGM）并领取每日的好运护身符。  
本项目基于 [mahjong_soul_api](https://github.com/MahjongRepository/mahjong_soul_api) 开发。
<br/><br/>
## 前期准备

1. 通过浏览器访问雀魂。
2. 按 `F12` 打开开发者模式。
3. 进入 `Network` 选项卡，搜索 `login`。
4. 检查搜索结果中出现的 xhr 或 fetch 格式的 login 文件的有效载荷。
5. 记录下所需的 `token` 和 `uid` 值。
<br/><br/>
## 设置方法

1. 在 GitHub 上 Fork 本项目。
2. 在你 Fork 的项目中进入 `Settings > Secrets and variables > Actions`。
3. 点击 `New repository secret`。
4. `Name` 填入 `UID`，`Secret` 填入前期准备中记录的 `uid` 值，然后点击 `Add secret`。
5. 创建另一个 Repository secret，`Name` 填入 `TOKEN`，`Secret` 填入前期准备中记录的 `token` 值，然后点击 `Add secret`。
6. 进入 `Settings > Actions > General`，将 `Workflow permissions` 设置为 `Read and write permissions`。
7. 默认服务器位置设置为日服。如果想要切换到国际服，请将 `main.py` 中的 `MS_HOST` 值修改为 `https://mahjongsoul.game.yo-star.com/`。
8. 默认连接时间设置为每天韩国时间上午 6 点 5 分。如需更改，请修改 `.github/workflows/main.yml` 中的 `cron` 值。
9. 进入顶部的 `Actions` 选项卡，点击 `I understand my workflows, go ahead and enable them` 按钮来激活工作流。
10. 在左侧 `Workflows` 中进入 `Login to Majsoul` 选项卡，点击 `Enable workflow`。
<br/><br/>
## 测试方法

1. 通过浏览器登录雀魂。
2. 在 `Actions > Workflows` 选项卡中点击 `Run workflow`。
3. 如果正常运行，由于双重连接，浏览器中的雀魂会话将被强制结束。
<br/><br/>
## 注意事项

- GitHub Actions 可能会比预定时间延迟最多 30 分钟，这取决于 GitHub 的服务器负载。
- 请注意不要向他人泄露你的 `token` 和 `uid`。
- GitHub Actions 在 60 天内没有仓库更新时会被禁用。请在 Actions 中点击 `Enable workflow` 来重新激活。

  ![image](https://github.com/4n3u/majsoul-monthTicket-auto/assets/167657823/87f5cd6f-b08a-409c-80b7-d822a224f1cc)