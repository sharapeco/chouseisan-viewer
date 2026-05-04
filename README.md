# 調整さんビューア

[調整さん](https://chouseisan.com/) のスケジュール調整結果を、見やすく表示する Web アプリです。

## 概要

調整さんのイベント URL を入力するだけで、候補日ごとの参加可否を一覧表示します。取得したデータはブラウザのローカルストレージにキャッシュされるため、同じ URL なら再取得なしで表示できます。

**主な機能**

- 調整さん URL を入力して CSV データを取得・表示
- 日程ごとにアコーディオン表示（○ / × / △ をカラー区別）
- 参加者名をクリックするとコメントをポップアップ表示
- 楽器名（Vn, Vla, Vc, Fl, Ob, Cl, … など）でソート
- 取得結果をローカルストレージにキャッシュ（オフライン閲覧可能）

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フロントエンド | React, TypeScript, Tailwind CSS v4, Vite |
| プロキシ | Cloudflare Workers (TypeScript) |
| パッケージ管理 | pnpm workspaces |

## アーキテクチャ

```
ブラウザ → Cloudflare Workers (proxy) → chouseisan.com/schedule/List/createCsv
```

調整さんは CORS を許可していないため、Cloudflare Workers をプロキシとして挟んで CSV を取得しています。

## ディレクトリ構成

```
chouseisan-viewer/
├── package.json           ルート (monorepo スクリプト)
├── pnpm-workspace.yaml    pnpm workspaces 設定
├── frontend/              フロントエンド
│   └── src/
│       ├── App.tsx
│       ├── components/    UI コンポーネント
│       ├── lib/           CSV・調整さんパーサー
│       └── utils/         楽器ソートなどのユーティリティ
└── proxy/                 Cloudflare Workers プロキシ
    └── src/index.ts
```

## セットアップ

```sh
# 依存インストール（全ワークスペース）
pnpm install
```

`.env` ファイルを `frontend/` に作成してプロキシの URL を設定します。

```
VITE_PROXY_URL=https://your-worker.workers.dev
```

ローカル開発時は `http://localhost:8787` を指定します。

## 開発

```sh
# frontend + proxy を同時起動
pnpm dev

# 個別起動
pnpm --filter ./frontend dev
pnpm --filter ./proxy dev

# テスト実行
pnpm test
```

## デプロイ

プロキシ（Cloudflare Workers）をデプロイした後、フロントエンドをビルドして任意の静的ホスティングに配置します。

```sh
# プロキシのデプロイ
pnpm --filter ./proxy deploy

# フロントエンドのビルド
pnpm --filter ./frontend build
```

## プロキシ API

| | |
|---|---|
| エンドポイント | `GET /api/csv?h={id}` |
| パラメータ | `h` — 調整さんのイベント ID（URL の `?h=` 以降） |
| レスポンス | UTF-8 の CSV テキスト |
| エラー | `h` が未指定の場合は 400 を返す |
