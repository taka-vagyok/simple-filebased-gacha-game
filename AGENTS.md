# Gacha App Project Agent Guidelines

このプロジェクトは、Google Apps Script (GAS) と Google Drive をバックエンドとした、子供向けガチャWebアプリケーションです。
開発は **仕様駆動開発 (Spec-Driven Development)** を採用しており、自然言語による仕様書 (`doc/spec.ja.md`) が **正本 (Source of Truth)** となります。

AIエージェントは、タスク（機能追加、バグ修正）を実行する際、必ず以下の **Strict Workflow** に従ってください。

## 🛑 Strict Workflow

ユーザーからの指示やバグ報告を受けた際、いきなりコードを修正してはいけません。必ず以下の手順を順守してください。

1. **調査 (Investigation)**
   * **現状把握**: `doc/spec.ja.md` (仕様書)、`gacha.yaml` (設定)、および関連コードを読み込みます。
   * **影響範囲**: 変更が既存の「昇格演出」や「確率ロジック」に矛盾しないか確認します。
   * **ログ確認**: バグ修正の場合は、エラーログや再現手順を確認します。

2. **仕様策定・設計 (Specification & Design)**
   * **仕様書更新**: 変更内容を `doc/spec.ja.md` に Gherkin 形式（Given/When/Then）で追記・修正します。
   * **セキュリティ/脆弱性対策**:
     * **Input Validation**: `items.yaml` やユーザー入力に悪意あるスクリプトが含まれていないか（XSS対策）。
     * **Access Control**: Google Drive のファイルアクセス権限が適切か。
     * **Data Integrity**: 確率計算（Weight）が不正に操作されないロジックになっているか。
   * **アーキテクチャ設計**:
     * GAS環境とローカルDocker環境の両立を考慮します。
     * 共通ロジック (`gacha-logic.js`) は **UMD形式** を維持し、Node.js (テスト) とブラウザ (GAS) の両方で動作するようにします。

3. **テスト設計・環境設計 (Test Design)**
   * **シナリオ作成**: 仕様書の Gherkin を元に、テストケース（正常系、異常系、境界値）をリストアップします。
   * **網羅性検証 (Decision Table)**: 複雑な条件分岐（特に抽選ロジック、連鎖昇格判定、演出分岐）については、**デシジョンテーブル（決定表）**を作成し、入力条件と期待する動作の組み合わせに漏れがないか検証します。
   * **テスト環境**:
     * **Unit Test**: Jest (`tests/unit/`) を使用。
     * **E2E Test**: Playwright (`tests/e2e/`) を使用。
   * **データ準備**: テスト用の `gacha.yaml` や `items.yaml` の定義が必要か判断します。

4. **ユーザー確認 (User Confirmation)**
   * **提案**: 作成した「仕様案 (`doc/spec.ja.md` の差分)」と「テスト方針（デシジョンテーブル含む）」をユーザーに提示します。
   * **スキップ条件**: アーキテクチャ変更を伴わない軽微な修正、またはユーザーから「お任せ」と言われた場合はスキップ可能です。それ以外は必ず承認を得てください。

5. **テストコード作成・環境構築 (Test Setup)**
   * **Unit Test**: ロジック部分（抽選アルゴリズム、YAMLパースなど）の単体テストコードを Jest で作成します。
   * **Mocking**: `DriveApp` や `HtmlService` などの GAS 固有クラス、および Backend API をローカルでテストするための Mock を準備します。

6. **実装・テスト・Lint (Implementation & Verify)**
   * **実装**: コードを変更します。共通ロジックは `gacha-logic.js` に集約してください。
   * **Lint**: 実装中は常に `biome check` を通過させ、フォーマットと静的解析エラーがない状態を保ちます。
   * **UT/E2E実行**: 作成したテストコードを実行し、Pass することを確認します。
   * **ループ処理**: 実装中に仕様の不備や矛盾が見つかった場合、直ちに「2. 仕様策定」に戻り、仕様書を修正してから実装を再開します。

7. **障害対応 (Bug Fix Loop)**
   * テスト失敗やデプロイ後の不具合が発生した場合、アドホックな修正は行わず、「1. 調査」 または 「2. 仕様策定」 の適切なステップに戻ってプロセスを再実行します。

8. **ドキュメント生成 (Documentation)**
   * **README更新**: 新機能や変更点に合わせて `README.md` (日本語/英語) を更新します。
   * **デモ画像更新**: UI変更があった場合は `npm run generate-gif` を実行し、`doc/gacha_demo.gif` を更新します。
   * **仕様書確定**: 最終的な挙動と `doc/spec.ja.md` が完全に一致していることを確認します。

## 🛠 Tech Stack & Rules

### Core Technologies
*   **Runtime**: Google Apps Script (GAS) / Node.js (Local Dev via Docker)
*   **Data Source**: Google Drive (Folder structure, YAML)
*   **Frontend**: HTML5, Vanilla JS, Tailwind CSS (CDN), Howler.js
*   **Testing**: Jest (Unit), Playwright (E2E)
*   **Graphics**: SVG (Inline)
*   **Format/Lint**: Biome

### Coding Conventions
*   **Language**: JavaScript (ES2019+ for GAS compatibility) / HTML / CSS
*   **Formatting**: Biome のデフォルト設定に従う。
*   **Comments**: JSDoc 形式で記述する。複雑なロジックには日本語でコメントを残す。
*   **AI Attribution**: ソースコード (`.js`) のヘッダーには必ず「AIによって作成された」旨のコメントを含めること。
    *   例: `// This project was created by Generative AI.`
*   **Variables**: わかりやすい英語の変数名を使用する（例: `promotionRate`, `capsuleElement`）。

### SVG Rules
*   **Design**: ポップなデザイン（ドリーム・エネルギー・メーカー）のトーン＆マナーを維持する。
*   **Namespacing**: 複数のSVG（`machine.svg` と `capsule.svg` など）を同一ページに読み込む際の ID 衝突を防ぐため、内部 ID にはプレフィックス（例: `m-`）を付与するなどして一意性を保つこと。

### Resource & Asset Conventions
*   **Audio**: 効果音ファイルは `gacha_data/sounds/` ディレクトリに配置し、MP3形式を使用すること。
*   **Animation Sync**: E2Eテストとアニメーションの同期には、`body` 要素の `data-gacha-status` 属性を使用すること。

### Dependency Management
*   **Root `package.json`**: 開発・テスト用ツール (Jest, Playwright, Biome 等) を管理。
*   **`docker/package.json`**: ローカルサーバー実行用 (Express 等) の依存関係を管理。これらは明確に分離すること。
*   **禁止**: Root にグローバルな実行環境を汚染するような変更を加えること。テスト実行に必要なライブラリは `devDependencies` に明記すること。

### Spec Rules (`doc/spec.ja.md`)
*   Gherkin記法 (前提, もし, ならば) を使用する。
*   「連鎖昇格ロジック」などの重要仕様は、具体的な数値例を含めて記述する。

## 🚨 Prohibitions & Guidelines (禁止事項・ガイドライン)

*   **仕様書 (`doc/spec.ja.md`) を無視した実装**: コードが仕様書と乖離することは許されません。
*   **`gacha.yaml` / `items.yaml` の構造破壊**: ユーザーが手動で編集することを前提としているため、複雑すぎるネストや可読性の低い構造は避けてください。
*   **GAS互換性の無視**: 外部npmパッケージを安易に `import` しないでください（バンドラー設定がない限り GAS では動きません）。CDNまたは標準ライブラリ、もしくは UMD 形式の自作モジュールを使用してください。
*   **マジックナンバーの多用**: 確率や設定値は可能な限り YAML から読み込むようにし、コードへのハードコードは避けてください。
*   **URLエンコーディングの徹底**: フロントエンドからバックエンドAPIを呼び出す際、ユーザー入力やファイルパスを含むパラメータは必ず `encodeURIComponent` でエスケープしてください。
*   **E2Eテストのモック重複**: Playwright で `page.route` を使用する際、汎用的なモック定義とテスト固有のモック定義が競合しないように注意してください。必要に応じて Regex ルーティングや `unroute` を使用してください。
*   **package-lock.jsonの管理**: 依存関係の変更がない限り、`package-lock.json` を更新しないでください。不必要な更新はリポジトリの履歴を汚します。
*   **ロジックの堅牢性**: 確率計算ロジックにおいては、重みが0の場合やリストが空の場合でもクラッシュや不正な値を返さないよう、適切なフォールバック処理を実装してください。
