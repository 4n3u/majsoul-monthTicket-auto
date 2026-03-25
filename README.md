# majsoul-monthTicket-auto

> Warning: Any disadvantages, account sanctions, or other consequences resulting from use of this project are solely the user's responsibility.

![image](https://github.com/4n3u/majsoul-monthTicket-auto/assets/167657823/89844790-9a47-40b7-8e65-ed07430f3917)
![image](https://github.com/4n3u/majsoul-monthTicket-auto/assets/167657823/720689fa-7237-4d85-8979-c3e768c7f1d9)

[日本語](https://github.com/4n3u/majsoul-monthTicket-auto/blob/main/README-ja.md) [한국어](https://github.com/4n3u/majsoul-monthTicket-auto/blob/main/README-ko.md) [中文](https://github.com/4n3u/majsoul-monthTicket-auto/blob/main/README-zh.md)

This project automates daily logins to Majsoul to achieve the attendance achievement (8bit Riichi BGM) and collect the daily Fortune Charm using GitHub Actions.  
<br/>
## Prerequisites

1. Access Majsoul through a browser.
2. Press `F12` to open developer mode.
3. Navigate to the `Network` tab and search for `login`.
4. Check the payload of the xhr or fetch format login file that appears in the search results.
5. Note down the required `token` and `uid` values.
<br/><br/>
## Setup Instructions

1. Fork this project on GitHub.
2. Navigate to `Settings > Secrets and variables > Actions` in your forked project.
3. Click `New repository secret`.
4. For `Name`, enter `UID`, and for `Secret`, enter the `uid` value noted earlier, then click `Add secret`.
5. Create another Repository secret with `Name` as `TOKEN` and `Secret` as the `token` value noted earlier, then click `Add secret`.
6. Go to `Settings > Actions > General` and set `Workflow permissions` to `Read and write permissions`.
7. The default server location is set to the JP server. If you wish to switch to the EN server, set the repository secret `MS_HOST` (or configure the environment variable locally) to `https://mahjongsoul.game.yo-star.com/`.
8. The default connection time is set to 6:05 AM KST daily. If you want to change this, modify the `cron` value in `.github/workflows/main.yml`.
9. Go to the `Actions` tab at the top and click the `I understand my workflows, go ahead and enable them` button to activate the workflows.
10. Navigate to the `Login to Majsoul` tab under `Workflows` on the left and click `Enable workflow`.
<br/><br/>
## Testing Instructions

1. Log in to Majsoul through a browser.
2. Click `Run workflow` under the `Actions > Workflows` tab.
3. If it operates correctly, the browser session of Majsoul will be forcibly terminated due to double connection.
<br/><br/>
## Caution

- GitHub Actions can be delayed by up to 30 minutes beyond the scheduled time due to server load on GitHub.
- Be cautious not to disclose your `token` and `uid` to others.
