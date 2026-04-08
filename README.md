# majsoul-monthTicket-auto

> Warning: Any disadvantages, account sanctions, or other consequences resulting from use of this project are solely the user's responsibility.

![image](https://github.com/4n3u/majsoul-monthTicket-auto/assets/167657823/89844790-9a47-40b7-8e65-ed07430f3917)
![image](https://github.com/4n3u/majsoul-monthTicket-auto/assets/167657823/720689fa-7237-4d85-8979-c3e768c7f1d9)

[日本語](README-ja.md) [한국어](README-ko.md) [中文](README-zh.md)

This project automates daily logins to Majsoul to achieve the attendance achievement (8bit Riichi BGM) and collect the daily Fortune Charm using GitHub Actions.  

## Prerequisites
1. Open Majsoul in your browser.
2. Press `F12` and switch to the `Console` tab.
3. Run the following code:
   ```js
   console.log(`UID: ${GameMgr.Inst.yostar_uid}\nTOKEN: ${GameMgr.Inst.yostar_accessToken}`);
   ```
4. Save the printed `UID` and `TOKEN` values for JP/EN/KR server setup.
5. For CN, use your account email and password instead. The script calculates the required password hash internally.

## Setup Instructions
1. Fork this repository on GitHub.
2. In your fork, go to `Settings > Secrets and variables > Actions`.
3. Click `New repository secret` and add `MS_SERVER`.
4. Set `MS_SERVER` to one of `jp`, `en`, `kr`, or `cn`. If you do not set it, the default is `jp`.
5. If you use the `jp`, `en`, or `kr` server, click `New repository secret` again and add `UID` and `TOKEN` with the values you saved earlier.
6. If you use the `cn` server, click `New repository secret` again and add `EMAIL` and `PASSWORD` with your account email and plaintext password.
7. Go to `Settings > Actions > General` and change `Workflow permissions` to `Read and write permissions`.
8. The default run time is 6:05 AM JST every day. To change it, edit the `cron` value in `.github/workflows/main.yml`.
9. Open the `Actions` tab and click `I understand my workflows, go ahead and enable them` to enable workflows.
10. Select `Login to Majsoul` from the left-side `Workflows` list and click `Enable workflow`.

## Testing Instructions
1. Stay logged in to Majsoul in your browser.
2. In GitHub, go to `Actions > Workflows` and click `Run workflow`.
3. If it works correctly, your browser session may be disconnected because of a duplicate login.

## Caution
- GitHub Actions may be delayed by up to 30 minutes depending on GitHub server load.
- Be careful not to expose your `token` and `uid` to others.

## Contact
- [Discord](https://discord.com/users/245702966085025802)
- [X](https://x.com/xflVsSnvB6cx8ZM)
