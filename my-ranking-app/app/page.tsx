import Link from "next/link";

export default function HomePage() {
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">マイランキングアプリ</h1>

      <div className="grid gap-4">
        <Link
          href="/ranking/index"
          className="block p-4 rounded-lg border hover:bg-gray-50"
        >
          📚 ランキング一覧を見る
        </Link>
        <Link
          href="/settings"
          className="block p-4 rounded-lg border hover:bg-gray-50"
        >
          ⚙️ 設定
        </Link>
      </div>
    </main>
  );
}
