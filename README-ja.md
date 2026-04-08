# majsoul-monthTicket-auto

> 警告: このプロジェクトの利用によって生じる不利益、アカウント制裁、その他すべての結果については、利用者自身が責任を負うものとします。

![image](https://github.com/4n3u/majsoul-monthTicket-auto/assets/167657823/89844790-9a47-40b7-8e65-ed07430f3917)
![image](https://github.com/4n3u/majsoul-monthTicket-auto/assets/167657823/720689fa-7237-4d85-8979-c3e768c7f1d9)

このプロジェクトは GitHub Actions を使って雀魂に自動ログインし、皆勤実績（8bit リーチ BGM）を達成しながら毎日の福の御守りを受け取ります。  

## 事前準備
1. ブラウザで雀魂にアクセスします。
2. `F12` を押して開発者ツールを開き、`Console` タブへ移動します。
3. 次のコードを実行します。
   ```js
   console.log(`UID: ${GameMgr.Inst.yostar_uid}\nTOKEN: ${GameMgr.Inst.yostar_accessToken}`);
   ```
4. 表示された `UID` と `TOKEN` を控え、JP/EN/KR サーバーの設定に使います。
5. CN サーバーでは、アカウントのメールアドレスとパスワードを使います。必要なハッシュはスクリプト側で計算されます。

## セットアップ手順
1. このリポジトリを GitHub でフォークします。
2. フォーク先で `Settings > Secrets and variables > Actions` を開きます。
3. `New repository secret` をクリックして `MS_SERVER` を追加します。
4. `MS_SERVER` には `jp`、`en`、`kr`、`cn` のいずれかを設定します。未設定の場合は `jp` が使われます。
5. `jp`、`en`、`kr` サーバーを使う場合は、`New repository secret` を再度クリックして `UID` と `TOKEN` を追加します。
6. `cn` サーバーを使う場合は、`New repository secret` を再度クリックして `EMAIL` と `PASSWORD` を追加します。値にはアカウントのメールアドレスと平文パスワードを入力します。
7. `Settings > Actions > General` に移動し、`Workflow permissions` を `Read and write permissions` に変更します。
8. 既定の実行時刻は毎日 JST 6:05 です。変更したい場合は `.github/workflows/main.yml` の `cron` を編集します。
9. リポジトリ上部の `Actions` タブで `I understand my workflows, go ahead and enable them` をクリックしてワークフローを有効化します。
10. 左の `Workflows` 一覧から `Login to Majsoul` を選択し、`Enable workflow` をクリックします。

## テスト手順
1. ブラウザで雀魂にログインした状態にします。
2. GitHub の `Actions > Workflows` で `Run workflow` をクリックし、手動で実行します。
3. 正常に動作すると二重ログインとなり、ブラウザ側のセッションが切断される場合があります。

## 注意事項
- GitHub Actions はサーバーの混雑状況によって最大 30 分遅延することがあります。
- `token` と `uid` は第三者に漏れないよう十分注意してください。

## お問い合わせ
- [Discord](https://discord.com/users/245702966085025802)
- [X](https://x.com/xflVsSnvB6cx8ZM)
