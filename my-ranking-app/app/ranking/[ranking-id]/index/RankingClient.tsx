"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Label,
} from "recharts";

type RankingContent = {
  id: string;
  title: string;
  description: string;
  image?: string;
  ratingJson?: any;
  comment?: string;
  Rating?: { id: string; axisId: string; score: number; Axis?: { name: string } }[];
};

type RankingData = {
  id: string;
  title: string;
  description: string;
  maxScore?: number;
  Axis?: { id: string; name: string; order: number }[];
  contents: RankingContent[];
};

export default function RankingClient({ ranking }: { ranking: RankingData }) {
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [selectedAxisId, setSelectedAxisId] = useState<string | null>(null);

  const contents = ranking.contents.map((content) => {
    // Rating データを軸名付きの形式に変換
    const ratingMap = new Map(
      content.Rating?.map((r) => [r.axisId, r.score]) || []
    );

    const rating = ranking.Axis?.map((axis) => ({
      axis: `${axis.name}`,
      axisName: axis.name,
      score: ratingMap.get(axis.id) || 0,
    })) || [];

    return {
      ...content,
      rating,
    };
  });

  // 総合点を計算（ratingの平均）
  const contentsWithScore = contents
    .map((content) => ({
      ...content,
      totalScore: content.rating
        ? Math.round((content.rating.reduce((sum, r) => sum + r.score, 0) / content.rating.length) * 10) / 10
        : 0,
    }))
    .sort((a, b) => b.totalScore - a.totalScore);

  // 各軸ごとのランキングを作成
  const axisRankings = ranking.Axis?.map((axis) => {
    const ranked = contentsWithScore
      .map((content) => ({
        ...content,
        axisScore: content.rating.find((r: any) => r.axisName === axis.name)?.score || 0,
      }))
      .sort((a, b) => b.axisScore - a.axisScore);
    return { axisId: axis.id, axisName: axis.name, contents: ranked };
  }) || [];

  const selectedContent = contentsWithScore.find(c => c.id === selectedContentId);

  // 表示するランキングを決定
  const displayRanking = selectedAxisId
    ? axisRankings.find((ar) => ar.axisId === selectedAxisId)?.contents || []
    : contentsWithScore;

  // カスタム Label コンポーネント（グラフの外側に点数を表示）
  const ScoreLabel = (props: any) => {
    const { x, y, score } = props;
    return (
      <g>
        <circle cx={x} cy={y} r={16} fill="#3b82f6" />
        <text
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="central"
          fill="white"
          fontSize="14"
          fontWeight="bold"
        >
          {score}
        </text>
      </g>
    );
  };

  // カスタム PolarAngleAxis の tick コンポーネント
  const CustomAxisTick = (props: any) => {
    const { x, y, payload } = props;
    const ratingData = selectedContent?.rating || [];
    const score = ratingData.find((r: any) => r.axisName === payload.value)?.score || 0;

    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#374151"
          fontSize="13"
          fontWeight="bold"
        >
          {payload.value}
        </text>
        <text
          x={0}
          y={16}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#2563eb"
          fontSize="14"
          fontWeight="bold"
        >
          {score}
        </text>
      </g>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            href="/ranking/index"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold mb-4"
          >
            <span>←</span>
            <span>ランキング一覧に戻る</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{ranking.title}</h1>
          <p className="text-gray-600">{ranking.description}</p>
        </div>

        {/* PC画面：左右分割レイアウト */}
        <div className="hidden md:flex gap-6">
          {/* 左側：ランキングリスト */}
          <div className="w-1/2">
            <div className="mb-4">
              <div className="flex gap-2 border-b">
                <button
                  onClick={() => {
                    setSelectedAxisId(null);
                    setSelectedContentId(null);
                  }}
                  className={`px-4 py-2 font-semibold transition ${
                    selectedAxisId === null
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-blue-600"
                  }`}
                >
                  総合点
                </button>
                {ranking.Axis?.map((axis) => (
                  <button
                    key={axis.id}
                    onClick={() => {
                      setSelectedAxisId(axis.id);
                      setSelectedContentId(null);
                    }}
                    className={`px-4 py-2 font-semibold transition ${
                      selectedAxisId === axis.id
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-600 hover:text-blue-600"
                    }`}
                  >
                    {axis.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              {displayRanking.map((content, index) => (
                <div
                  key={content.id}
                  onClick={() => setSelectedContentId(content.id)}
                  className={`cursor-pointer border rounded-lg p-4 hover:bg-gray-50 transition ${
                    selectedContentId === content.id ? "bg-blue-50 border-blue-300" : "bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-blue-600">#{index + 1}</span>
                      <span className="font-medium text-gray-900">{content.title}</span>
                    </div>
                    <span className="text-lg font-semibold text-gray-700">
                      {selectedAxisId
                        ? content.rating.find((r: any) => ranking.Axis?.find((a) => a.id === selectedAxisId)?.name === r.axisName)?.score || 0
                        : content.totalScore}
                      点
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 右側：コンテンツ詳細 */}
          <div className="w-1/2">
            {selectedContent ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">{selectedContent.title}</h3>
                  <Link
                    href={`/ranking/${ranking.id}/contents/${selectedContent.id}/edit`}
                    className="text-gray-600 hover:text-blue-600 transition p-2 rounded hover:bg-blue-50"
                    title="編集"
                  >
                    <span className="text-xl">⚙️</span>
                  </Link>
                </div>
                {selectedContent.image && (
                  <img
                    src={selectedContent.image}
                    alt={selectedContent.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}

                {/* 説明 */}
                <div className="mb-6">
                  <p className="text-gray-700 leading-relaxed">
                    {selectedContent.description}
                  </p>
                </div>

                {/* 外部リンク */}
                {selectedContent.comment && selectedContent.comment.includes("リンク:") && (
                  <div className="mb-6">
                    {selectedContent.comment
                      .split("\n")
                      .filter((line: string) => line.includes("リンク:"))
                      .map((line: string, idx: number) => {
                        const url = line
                          .replace("リンク:", "")
                          .trim();
                        return (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold"
                            title={url}
                          >
                            <span>🔗</span>
                            <span className="underline">
                              外部リンク
                            </span>
                          </a>
                        );
                      })}
                  </div>
                )}

                {/* レーダーグラフ */}
                {selectedContent.rating && selectedContent.rating.length > 0 && (
                  <div className="flex justify-center pointer-events-none">
                    <div className="w-full bg-gradient-to-b from-blue-50 to-transparent rounded-2xl p-2 shadow-lg border border-blue-100">
                      <ResponsiveContainer width="100%" height={280} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                        <RadarChart data={selectedContent.rating}>
                          <PolarGrid 
                            stroke="#dbeafe" 
                            strokeDasharray="0"
                            fill="none"
                          />
                          <PolarAngleAxis
                            dataKey="axis"
                            stroke="#6b7280"
                            tick={<CustomAxisTick />}
                          />
                          <PolarRadiusAxis
                            angle={90}
                            domain={[0, ranking.maxScore || 10]}
                            stroke="#cbd5e1"
                            tick={{ fontSize: 11, fill: "#6b7280" }}
                          />
                          <Radar
                            name="評価"
                            dataKey="score"
                            stroke="#2563eb"
                            fill="#3b82f6"
                            fillOpacity={0.7}
                            animationDuration={1200}
                            animationEasing="ease-out"
                            isAnimationActive={true}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
                左側のランキングから項目を選択してください
              </div>
            )}
          </div>
        </div>

        {/* スマホ画面：アコーディオン形式 */}
        <div className="md:hidden">
          <div className="mb-4">
            <div className="flex gap-2 border-b overflow-x-auto">
              <button
                onClick={() => {
                  setSelectedAxisId(null);
                  setSelectedContentId(null);
                }}
                className={`px-4 py-2 font-semibold transition whitespace-nowrap ${
                  selectedAxisId === null
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600"
                }`}
              >
                総合点
              </button>
              {ranking.Axis?.map((axis) => (
                <button
                  key={axis.id}
                  onClick={() => {
                    setSelectedAxisId(axis.id);
                    setSelectedContentId(null);
                  }}
                  className={`px-4 py-2 font-semibold transition whitespace-nowrap ${
                    selectedAxisId === axis.id
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600"
                  }`}
                >
                  {axis.name}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            {displayRanking.map((content, index) => (
              <div key={content.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div
                  onClick={() => setSelectedContentId(selectedContentId === content.id ? null : content.id)}
                  className="cursor-pointer p-4 border-b"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-blue-600">#{index + 1}</span>
                      <span className="font-medium text-gray-900">{content.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-gray-700">
                        {selectedAxisId
                          ? content.rating.find((r: any) => ranking.Axis?.find((a) => a.id === selectedAxisId)?.name === r.axisName)?.score || 0
                          : content.totalScore}
                        点
                      </span>
                      <span className={`transform transition-transform ${selectedContentId === content.id ? 'rotate-180' : ''}`}>
                        ▼
                      </span>
                    </div>
                  </div>
                </div>

                {selectedContentId === content.id && (
                  <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-lg">{content.title}</h4>
                      <Link
                        href={`/ranking/${ranking.id}/contents/${content.id}/edit`}
                        className="text-gray-600 hover:text-blue-600 transition p-2 rounded hover:bg-blue-50"
                        title="編集"
                      >
                        <span className="text-lg">⚙️</span>
                      </Link>
                    </div>
                    {content.image && (
                      <img
                        src={content.image}
                        alt={content.title}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    )}
                    <p className="text-gray-700">{content.description}</p>

                    {content.rating && (
                      <div className="mb-4">
                        <h4 className="font-semibold mb-2">評価詳細</h4>
                        <div className="space-y-1">
                          {content.rating.map((r) => (
                            <div key={r.axis} className="flex justify-between text-sm">
                              <span>{r.axis}:</span>
                              <span>{r.score}/5</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 pt-2 border-t text-center font-bold">
                          総合: {content.totalScore}点
                        </div>
                      </div>
                    )}

                    {content.comment && (
                      <p className="text-gray-700 text-sm italic mb-4">"{content.comment}"</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <Link
            href={`/ranking/${ranking.id}/contents/create`}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            新しいコンテンツを追加
          </Link>
        </div>
      </div>
    </div>
  );
}