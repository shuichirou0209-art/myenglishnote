# GitHub Pages + PWA 公開ガイド

## 📋 必要なファイル確認

以下のファイルが全て揃っているか確認してください：

```
myproject001/
├── index.html
├── manifest.json
├── sw.js
├── icon.png
├── css/
│   └── style.css
└── js/
    └── script.js
```

## 🚀 GitHub Pages公開手順

### 1. GitHubレポジトリを作成
- リポジトリ名: `<username>.github.io`
  （例：`shuichirou.github.io`）
- または任意の名前でOK

### 2. ファイルをGitHubにプッシュ
```bash
cd c:\Users\Shuichirou\Documents\myproject001

git init
git add .
git commit -m "Initial commit: Add PWA for expression stock app"
git branch -M main
git remote add origin https://github.com/<username>/<repo>.git
git push -u origin main
```

### 3. GitHub Pages設定
- GitHubレポジトリの Settings → Pages
- Source: `main` ブランチ → Save
- 数分で公開される

## 📱 スマートフォンにインストール

### iOS（Safari）
1. Safariでアプリを開く
2. 共有ボタン → 「ホーム画面に追加」
3. アプリ名確認して「追加」

### Android（Chrome）
1. Chromeでアプリを開く
2. メニュー（⋮）→ 「アプリをインストール」
3. または自動表示される「インストール」ボタンをタップ

## ✅ PWA確認チェックリスト

- [ ] manifest.json が正しく配置されている
- [ ] icon.png が192x192以上のサイズ
- [ ] HTTPS接続で公開されている
- [ ] Service Worker が登録されている
- [ ] index.html に manifest.json のリンクがある

## 💡 トラブルシューティング

### アプリがインストールできない
→ DevToolsで以下を確認：
- Application → Manifest に エラーがないか
- Application → Service Worker が登録されているか
- Console にエラーが出ていないか

### icon.pngのサイズについて
- 最低192x192px推奨
- 512x512pxなら高解像度の端末にも対応
- 現在のicon.pngが小さければ、大きなサイズで置き換えてください

## 🔧 manifest.json カスタマイズ例

アプリ名を変更したい場合、manifest.json を編集：
```json
{
  "name": "あなたのアプリ名",
  "short_name": "短い名前",
  ...
}
```

その後、GitHubに再度プッシュしてください。

## 📚 参考資料
- [MDN: Web App Manifest](https://developer.mozilla.org/ja/docs/Web/Manifest)
- [MDN: Service Worker](https://developer.mozilla.org/ja/docs/Web/API/Service_Worker_API)
- [Google: PWAについて](https://web.dev/progressive-web-apps/)
