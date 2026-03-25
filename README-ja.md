# majsoul-monthTicket-auto

> 警告: このプロジェクトの利用によって生じる不利益、アカウント制裁、その他すべての結果については、利用者自身が責任を負うものとします。

![image](https://github.com/4n3u/majsoul-monthTicket-auto/assets/167657823/89844790-9a47-40b7-8e65-ed07430f3917)
![image](https://github.com/4n3u/majsoul-monthTicket-auto/assets/167657823/720689fa-7237-4d85-8979-c3e768c7f1d9)

このプロジェクトは GitHub Actions を使って雀魂に自動ログインし、皆勤実績（8bit リーチ BGM）を達成しながら毎日の福の御守りを受け取ります。  
<br/>
## 事前準備

1. ブラウザで雀魂にアクセスします。
2. `F12` を押して開発者ツールを開き、`Network` タブへ移動します。
3. `login` を検索し、表示された xhr または fetch リクエストのペイロードを確認します。
4. ペイロードから `token` と `uid` を控えます。
<br/><br/>
## セットアップ手順

1. このリポジトリを GitHub でフォークします。
2. フォーク先で `Settings > Secrets and variables > Actions` を開きます。
3. `New repository secret` をクリックし、`UID` という名前で控えた `uid` を登録します。
4. 同様に `TOKEN` という名前で `token` を登録します。
5. `Settings > Actions > General` に移動し、`Workflow permissions` を `Read and write permissions` に変更します。
6. 既定サーバーは JP です。EN サーバーへ切り替える場合は、リポジトリのシークレット（またはローカル環境変数）に `MS_HOST=https://mahjongsoul.game.yo-star.com/` を設定してください。
7. 既定の実行時刻は毎日 KST 6:05 です。変更したい場合は `.github/workflows/main.yml` の `cron` を編集します。
8. リポジトリ上部の `Actions` タブで `I understand my workflows, go ahead and enable them` をクリックしてワークフローを有効化します。
9. 左の `Workflows` 一覧から `Login to Majsoul` を選択し、`Enable workflow` をクリックします。
<br/><br/>
## テスト手順

1. ブラウザで雀魂にログインした状態にします。
2. GitHub の `Actions > Workflows` で `Run workflow` をクリックし、手動で実行します。
3. 正常に動作すると二重ログインとなり、ブラウザ側のセッションが切断されます。
<br/><br/>
## 注意事項

- GitHub Actions はサーバーの混雑状況によって最大 30 分遅延することがあります。
- `token` と `uid` は第三者に漏れないよう十分注意してください。
