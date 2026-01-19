# テスト設計書

本プロジェクトにおけるテストの方針と、品質保証のための検証手順について記載します。

## 1. テスト方針
本アプリケーションは、DockerコンテナおよびGoogle Apps Script (GAS) という異なる2つの環境で動作します。
このうち、Docker環境（ローカル実行）におけるテストは、**エンドツーエンド (E2E) テスト** を主体として行います。

ユーザーが実際にブラウザで操作するのと同様のシナリオを自動化、または手動で確認することで、フロントエンドとバックエンド（`server.js`）の連携を保証します。

## 2. テスト環境
テストは原則として、本番相当の構成である **Docker Compose 環境** に対して実施します。

### 実行手順
```bash
cd docker
docker-compose up -d
# テスト対象URL: http://localhost:8000
```

## 3. テストシナリオ
以下の項目を検証対象とします。

### 3.1. 初期表示確認 (Smoke Test)
*   **目的**: アプリケーションが正しく起動し、リソースがロードされているか確認する。
*   **確認項目**:
    *   HTTPステータス 200 が返却されること。
    *   タイトル（例：「伝説の装備ガチャ」）が表示されていること。
    *   ガチャマシンのSVG画像（`#machine`）が表示されていること。
    *   コンソールにエラーが出ていないこと。

### 3.2. データ読み込みとAPI連携
*   **目的**: フロントエンドがバックエンドAPI (`/api/getGachaData`) と通信できているか確認する。
*   **確認項目**:
    *   ページ読み込み直後、「ガチャを回す！」ボタンが **無効 (disabled)** であること。
    *   API通信完了後、ボタンが **有効 (enabled)** に切り替わること。
    *   `docker-compose` でマウントした `gacha.yaml` および `items.yaml` のデータが正しく読み込まれていること。

### 3.3. ガチャ実行フローと連鎖昇格
*   **目的**: ユーザーインタラクション、連鎖昇格アニメーション、結果表示の整合性を確認する。
*   **手順**:
    1.  「ガチャを回す！」ボタンをクリックする。
*   **確認項目**:
    *   **ループ演出**:
        *   マシンが揺れるアニメーション (`.animate-shake`) -> カプセル出現。
        *   昇格する場合：「昇格チャンス！」等の表示 -> カプセル消滅 -> ループ再開。
        *   昇格先のグレードに応じた色（例：青→赤）に変化すること。
    *   **最終結果**:
        *   結果画面 (`#result-area`) が表示されること。
        *   アイテム名、画像、説明文が最終グレードの設定と一致していること。

### 3.4. 確率検証（手動/統計）
*   **目的**: `gacha.yaml` の設定通りに昇格が発生するか確認する。
*   **手順**:
    *   `gacha.yaml` の昇格確率を一時的に 1.0 (100%) にして、必ず昇格することを確認する。
    *   逆に 0.0 (0%) にして、昇格しないことを確認する。

## 4. 自動テストの実装指針 (推奨)
将来的にCI/CDパイプラインに組み込む場合、**Playwright** の使用を推奨します。

### サンプルコード (Python/Playwright)
```python
from playwright.sync_api import sync_playwright, expect
import re

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # 1. アクセス
        page.goto("http://localhost:8000")

        # 2. 初期状態確認
        btn = page.locator("#btn-pull")
        expect(btn).not_to_be_disabled(timeout=5000)

        # 3. ガチャ実行
        btn.click()

        # 4. アニメーション確認
        machine = page.locator("#machine")
        expect(machine).to_have_class(re.compile(r"animate-shake"))

        # 5. 結果表示待機
        result = page.locator("#result-content")
        expect(result).to_be_visible(timeout=10000)

        browser.close()

if __name__ == "__main__":
    run()
```
