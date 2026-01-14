import Link from "next/link";
import { prisma } from "@/lib/prisma"; // Prisma Client をインポート

// Server Component で直接 DB にアクセス
export default async function RankingListPage() {
  // DB からランキング一覧を取得
  const rankings = await prisma.ranking.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">ランキング一覧</h1>

      <div className="space-y-3">
        {rankings.map((ranking) => (
          <Link
            key={ranking.id}
            href={`/ranking/${ranking.id}/index`}
            className="block p-4 border rounded hover:bg-gray-50"
          >
            {ranking.title}
          </Link>
        ))}
      </div>

      <div>
        <Link
          href="/ranking/create"
          className="inline-block mt-4 px-4 py-2 border rounded hover:bg-gray-50"
        >
          ＋ ランキングを新しく作る
        </Link>
      </div>
    </main>
  );
}
