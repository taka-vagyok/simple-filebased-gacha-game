# お楽しみガチャアプリ (Gacha App)

![Gacha Machine](doc/gacha_machine.png)

シンプルで楽しい、子供から大人まで楽しめるWebガチャアプリです。
コンテナ環境（Docker）で手軽に実行できるほか、Google Apps Script (GAS) と連携して Google Drive 上のデータを活用することも可能です。

## 特徴
*   **アニメーション演出**: SVGで描画されたガチャマシンが動く！回す！ポンッと出る！
*   **設定が簡単**: `items.yaml` にアイテムリストを書くだけで、確率設定や画像の指定が可能。
*   **Markdown対応**: 景品の説明文はMarkdown形式で記述でき、リッチなテキスト表示が可能。
*   **ハイブリッド構成**: Dockerコンテナでのローカル実行と、サーバーレスなGAS運用の両方に対応。

## 遊び方 (Docker / ローカル実行)

Dockerを使って、すぐに自分のPCでガチャを回すことができます。

### 1. 準備
このリポジトリをクローンします。

```bash
git clone <repository-url>
cd <repository-name>
```

### 2. データの設定
`gacha_data/gacha1/` フォルダにガチャの中身を設定します。
デフォルトでサンプル（伝説の剣、回復薬）が入っています。

*   `items.yaml`: 景品のリストと確率（weight）を定義します。
*   画像ファイル (`.png` 推奨) と 説明ファイル (`.md`) を同じフォルダに置きます。

**items.yaml の例:**
```yaml
- id: 1
  name: 伝説の剣
  weight: 5
  image: sword.png
  description: sword.md
- id: 2
  name: 回復薬
  weight: 95
  image: potion.png
  description: potion.md
```

### 3. 起動
Docker Compose を使用して起動します。

```bash
cd docker
docker-compose up
```

ブラウザで `http://localhost:8000` にアクセスしてください。

## 遊び方 (Google Apps Script)

Google Drive上のファイルをデータソースとして利用する場合の手順です。

1.  **Google Driveの準備**:
    *   ルートに `MyGachaApp` というフォルダを作成します。
    *   その中に `gacha1` フォルダを作成し、`items.yaml` や画像などをアップロードします。
2.  **デプロイ**:
    *   `clasp` などを使って `gacha.js` と `gacha.html` を GAS プロジェクトにプッシュします。
3.  **実行**:
    *   Webアプリとしてデプロイし、発行されたURLにアクセスします。

## 開発者向け情報

### ディレクトリ構成
```
.
├── gacha.html        # フロントエンド (Vue.jsなどを使わないVanilla JS + Tailwind)
├── gacha_data/       # ローカル実行用のデータフォルダ
│   └── gacha1/       # ガチャセット1
├── docker/           # Docker関連ファイル
│   ├── Dockerfile
│   └── server.js     # ローカル実行用簡易サーバー
├── gacha.js          # GAS用バックエンドコード
└── doc/              # ドキュメント・仕様書
```

### 技術スタック
*   **Frontend**: HTML5, Tailwind CSS, SVG Animation
*   **Backend (Local)**: Node.js, Express
*   **Backend (Cloud)**: Google Apps Script
