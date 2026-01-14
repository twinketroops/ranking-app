"use client";

import Link from "next/link";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { prisma } from "@/lib/prisma";

type ParamsType = { "ranking-id": string; "content-id": string };

type RatingItem = {
  axis: string;
  score: number;
};

export default async function ContentDetailPage({
  params,
}: {
  params: ParamsType;
}) {
  const rankingId = params["ranking-id"];
  const contentId = params["content-id"];

  // DBからデータを取得
  const content = await prisma.content.findUnique({
    where: { id: contentId },
  });

  if (!content) {
    return <div>コンテンツが見つかりません</div>;
  }

  const rating = content.ratingJson as RatingItem[];

  const totalScore = rating.reduce((sum, item) => sum + item.score, 0);
  const maxScore = rating.length * 5;

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{content.title}</h1>
      </div>

      {content.image && (
        <img
          src={content.image}
          alt={content.title}
          className="w-full h-64 object-cover rounded-lg"
        />
      )}

      <div>
        <h2 className="text-xl font-semibold">説明</h2>
        <p className="text-gray-700 mt-2 leading-relaxed">
          {content.description}
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">評価（5軸）</h2>

        <div className="flex justify-center">
          <RadarChart
            cx={200}
            cy={200}
            outerRadius={120}
            width={400}
            height={400}
            data={rating}
          >
            <PolarGrid />
            <PolarAngleAxis dataKey="axis" />
            <PolarRadiusAxis angle={90} domain={[0, 5]} />
            <Radar
              name="評価"
              dataKey="score"
              fill="#3b82f6"
              fillOpacity={0.6}
              stroke="#2563eb"
            />
          </RadarChart>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold">詳細スコア</h2>
        <ul className="mt-2 space-y-1 text-gray-700">
          {rating.map((item) => (
            <li key={item.axis}>
              <span className="font-semibold">{item.axis}：</span>
              {item.score} / 5
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-xl font-semibold">総合評価</h2>
        <p className="text-lg mt-1 font-bold">
          {totalScore} / {maxScore} 点
        </p>
      </div>

      <div className="pt-4">
        <Link
          href={`/ranking/${rankingId}/index`}
          className="inline-block px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          ← ランキングに戻る
        </Link>
      </div>
    </div>
  );
}
