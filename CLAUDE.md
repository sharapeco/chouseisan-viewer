# あつまる君

## 技術スタック

- フロントエンド: React, TypeScript, Tailwind CSS v4, Vite
- プロキシサーバー: Cloudflare Workers (TypeScript)
- パッケージマネージャー: pnpm (workspaces)

## ディレクトリ構成

```
chouseisan-viewer/
├── package.json          …… ルート (monorepo スクリプト)
├── pnpm-workspace.yaml   …… pnpm workspaces 設定
├── frontend/             …… フロントエンド
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       └── index.css
└── proxy/                …… Cloudflare Workers プロキシ
    ├── wrangler.toml
    ├── tsconfig.json
    └── src/
        └── index.ts
```

## 開発コマンド

```sh
# 依存インストール（全ワークスペース）
pnpm install

# frontend + proxy を同時起動
pnpm dev

# 個別起動
pnpm --filter ./frontend dev
pnpm --filter ./proxy dev
```

## プロキシ (proxy/)

- エンドポイント: `GET /api/csv?h={id}`
- 調整さんの CSV エクスポート URL にリクエストを転送して返す
- `h` パラメータがない場合は 400 を返す
- CORS ヘッダー付き (`Access-Control-Allow-Origin: *`)
- デプロイ: `pnpm --filter ./proxy deploy` (wrangler deploy)
