// app/ranking/[ranking-id]/index/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import RankingClient from "./RankingClient";

type RankingContent = {
  id: string;
  title: string;
  description: string;
  image?: string;
  ratingJson?: any;
  comment?: string;
};

type RankingData = {
  id: string;
  title: string;
  description: string;
  contents: RankingContent[];
};

export default async function RankingPage({ params }: { params: Promise<{ "ranking-id": string }> }) {
  const { "ranking-id": rankingId } = await params;

  // DBからランキングとコンテンツを取得
  const ranking = await prisma.ranking.findUnique({
    where: { id: rankingId },
    include: {
      Axis: {
        orderBy: { order: "asc" },
      },
      contents: {
        include: {
          Rating: {
            include: {
              Axis: true,
            },
          },
        },
      },
    },
  });

  if (!ranking) {
    return <div>ランキングが見つかりません</div>;
  }

  return <RankingClient ranking={ranking as RankingData} />;
}
