# majsoul-monthTicket-auto
![image](https://github.com/4n3u/majsoul-monthTicket-auto/assets/167657823/89844790-9a47-40b7-8e65-ed07430f3917)
![image](https://github.com/4n3u/majsoul-monthTicket-auto/assets/167657823/720689fa-7237-4d85-8979-c3e768c7f1d9)

このプロジェクトは、GitHub Actionsを使用して毎日のログインを自動化し、雀魂での出席成果（8ビットリーチBGM）を達成し、毎日の運気アップのお守りを受け取るためのものです。  
このプロジェクトは[mahjong_soul_api](https://github.com/MahjongRepository/mahjong_soul_api)に基づいています。
<br/><br/>
## 事前準備

1. ブラウザで雀魂にアクセスします。
2. `F12`を押して開発者モードを開きます。
3. `Network`タブに移動し、`login`と検索します。
4. 検索結果に表示されるxhrまたはfetch形式のloginファイルのペイロードを確認します。
5. 必要な`token`と`uid`の値をメモしておきます。
<br/><br/>
## 設定方法

1. GitHubでこのプロジェクトをフォークしてください。
2. フォークしたプロジェクトで`Settings > Secrets and variables > Actions`に進みます。
3. `New repository secret`をクリックします。
4. `Name`には`UID`を、`Secret`には事前にメモした`uid`の値を入力して、`Add secret`をクリックします。
5. 別のRepository secretを作成し、`Name`には`TOKEN`、`Secret`には事前にメモした`token`の値を入力して、`Add secret`をクリックします。
6. `Settings > Actions > General`に移動し、`Workflow permissions`を`Read and write permissions`に設定します。
7. デフォルトのサーバー位置はJPサーバーに設定されています。ENサーバーに変更したい場合は、`main.py`の`MS_HOST`の値を`https://mahjongsoul.game.yo-star.com/`に変更してください。
8. デフォルトの接続時間は毎日の韓国時間午前6時5分に設定されています。変更したい場合は、`.github/workflows/main.yml`の`cron`の値を修正してください。
9. 上部の`Actions`タブに進み、`I understand my workflows, go ahead and enable them`ボタンをクリックしてワークフローを有効にします。
10. 左側の`Workflows`から`Login to Majsoul`タブに進み、`Enable workflow`をクリックします。
<br/><br/>
## テスト方法

1. ブラウザで雀魂にログインします。
2. `Actions > Workflows`タブで`Run workflow`をクリックします。
3. 正常に動作すれば、二重接続のため雀魂のブラウザセッションが強制的に終了されます。
<br/><br/>
## 注意事項

- GitHub Actionsは、予定された時間から最大30分の遅延が発生することがあります。これはGitHubのサーバー負荷によって異なります。
- 他人に`token`や`uid`が公開されないように注意してください。
- GitHub Actionsは60日間リポジトリに更新がないと無効化されます。再度有効にするには、Actionsで`Enable workflow`をクリックしてください。

  ![image](https://github.com/4n3u/majsoul-monthTicket-auto/assets/167657823/87f5cd6f-b08a-409c-80b7-d822a224f1cc)

