# マイランキングアプリ - プロジェクト概要

## 📌 アプリの説明

**マイランキングアプリ**は、カスタムランキングを作成・管理・編集できるWebアプリです。好きな商品、映画、本など、あらゆるものをランキング形式で整理し、複数の軸（評価基準）で評価することができます。

## 🎯 主な機能

### 1. **ランキング管理**
- ランキングの作成、表示、編集、削除
- ランキングのタイトルと説明を設定可能
- データベースに永続化されるため、いつでも参照可能

### 2. **コンテンツ管理**
- 各ランキングに複数のコンテンツ（アイテム）を追加可能
- コンテンツごとに以下の情報を管理：
  - タイトル
  - 説明
  - 画像
  - コメント
  - **複数軸の評価データ**（JSON形式で柔軟に対応）

### 3. **複数軸評価システム**
- 単一の順位だけでなく、複数の評価軸を設定可能
- 例：「おいしさ」「見た目」「コスパ」など複数の基準で評価
- 評価データはJSON形式で保存され、柔軟な拡張が可能

### 4. **ランキング表示**
- 作成したランキング一覧を表示
- 各ランキングの詳細表示
- グラフ表示（recharts ライブラリを使用）による可視化

### 5. **設定画面**
- ユーザー設定機能（実装は拡張予定）

## 🛠️ 技術スタック

### **フロントエンド**
- **Next.js 16.0.8** - React フレームワーク
- **React 19.2.1** - UI ライブラリ
- **TypeScript** - 型安全性
- **Tailwind CSS** - スタイリング
- **Recharts** - グラフ・チャート表示

### **バックエンド**
- **Next.js API Routes** - REST API
- **Prisma ORM** - データベース管理
- **PostgreSQL** - データベース

### **開発ツール**
- **ESLint** - コード品質管理
- **PostCSS & Autoprefixer** - CSS 処理

## 📁 プロジェクト構造

```
my-ranking-app/
├── app/                          # Next.js アプリケーション
│   ├── api/                       # API ルート
│   │   ├── ranking/              # ランキング関連 API
│   │   ├── test/                 # テスト用 API
│   │   └── ...
│   ├── ranking/                  # ランキング関連ページ
│   │   ├── index/                # ランキング一覧
│   │   ├── create/               # ランキング作成
│   │   ├── [ranking-id]/         # ランキング詳細
│   │   │   ├── index/            # ランキング表示
│   │   │   ├── edit/             # ランキング編集
│   │   │   └── contents/         # コンテンツ管理
│   │   └── ...
│   ├── settings/                 # 設定ページ
│   ├── globals.css               # グローバルスタイル
│   ├── layout.tsx                # レイアウト
│   └── page.tsx                  # ホームページ
├── lib/
│   └── prisma.ts                 # Prisma クライアント
├── prisma/
│   ├── schema.prisma             # データベーススキーマ
│   └── migrations/               # マイグレーション履歴
├── public/                       # 静的ファイル
└── package.json                  # 依存パッケージ

```

## 🗄️ データベーススキーマ

### **Ranking テーブル**
```
- id: 主キー (CUID)
- title: ランキングのタイトル
- description: 説明（オプション）
- contents: Content テーブルとの関連
- createdAt: 作成日時
```

### **Content テーブル**
```
- id: 主キー (CUID)
- rankingId: 外部キー（Ranking への参照）
- title: コンテンツのタイトル
- description: 説明（オプション）
- image: 画像URL（オプション）
- ratingJson: 複数軸の評価データ（JSON形式）
- comment: コメント（オプション）
- createdAt: 作成日時
- ranking: Ranking テーブルとの関連
```

## 🚀 使用方法

### 開発環境での実行
```bash
npm install      # 依存パッケージをインストール
npm run dev      # 開発サーバー起動（localhost:3000）
```

### ビルドして本番環境で実行
```bash
npm run build    # プロダクションビルド
npm start        # 本番サーバー起動
```

## 📝 API エンドポイント

- **GET /api/ranking** - ランキング一覧取得
- **POST /api/ranking** - ランキング作成
- **GET /api/ranking/[ranking-id]** - ランキング詳細取得
- **PUT /api/ranking/[ranking-id]** - ランキング更新
- **DELETE /api/ranking/[ranking-id]** - ランキング削除
- **GET /api/ranking/[ranking-id]/contents** - コンテンツ一覧取得
- **POST /api/ranking/[ranking-id]/contents** - コンテンツ追加
- **PUT /api/ranking/[ranking-id]/contents/[content-id]** - コンテンツ更新
- **DELETE /api/ranking/[ranking-id]/contents/[content-id]** - コンテンツ削除

## 🎨 特徴

✅ **レスポンシブデザイン** - Tailwind CSS による モダンで見やすいUI  
✅ **複数軸評価** - 柔軟な評価システムで多角的な分析が可能  
✅ **データ永続化** - PostgreSQL に保存され、いつでも参照可能  
✅ **直感的な操作** - シンプルで使いやすいUI/UX  
✅ **ビジュアライゼーション** - Recharts によるグラフ表示で分析が容易  

## 📋 今後の拡張予定

- ユーザー認証・認可機能
- ランキング共有機能
- ランキングの公開/非公開設定
- コラボレーション機能（複数人での編集）
- より詳細なグラフ分析機能
- エクスポート機能（CSV、PDF）
- ダークモード対応

---

**作成日時**: 2026年1月14日
