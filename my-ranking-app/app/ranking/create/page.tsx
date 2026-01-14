"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Axis {
  id: string;
  name: string;
  maxScore: number;
}

export default function CreateRankingPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [maxScore, setMaxScore] = useState(5);
  const [axes, setAxes] = useState<Axis[]>([
    { id: "0", name: "", maxScore: 5 },
    { id: "1", name: "", maxScore: 5 },
    { id: "2", name: "", maxScore: 5 },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addAxis = () => {
    if (axes.length < 10) {
      setAxes([
        ...axes,
        { id: Date.now().toString(), name: "", maxScore: 5 },
      ]);
    }
  };

  const removeAxis = (id: string) => {
    if (axes.length > 1) {
      setAxes(axes.filter((axis) => axis.id !== id));
    }
  };

  const updateAxis = (id: string, field: string, value: any) => {
    setAxes(
      axes.map((axis) =>
        axis.id === id ? { ...axis, [field]: value } : axis
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // バリデーション
    if (!title.trim()) {
      setError("ランキング名は必須です");
      return;
    }

    if (axes.some((axis) => !axis.name.trim())) {
      setError("すべての評価軸に名前を入力してください");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/ranking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          maxScore,
          axes: axes.map((axis) => ({
            name: axis.name.trim(),
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "ランキングの作成に失敗しました");
      }

      const ranking = await response.json();
      router.push(`/ranking/${ranking.id}/index`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "エラーが発生しました"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">ランキング作成</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ランキング名 */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            ランキング名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例：好きなラーメン店"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>

        {/* ランキングの内容 */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            ランキングの内容
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="このランキングについての説明を入力してください（オプション）"
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>

        {/* 評価軸 */}
        <div>
          <label className="block text-sm font-semibold mb-4">
            評価軸 <span className="text-red-500">*</span>
          </label>

          <div className="space-y-3">
            {axes.map((axis, index) => (
              <div
                key={axis.id}
                className="flex gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50"
              >
                <div className="flex-grow space-y-2">
                  <input
                    type="text"
                    value={axis.name}
                    onChange={(e) =>
                      updateAxis(axis.id, "name", e.target.value)
                    }
                    placeholder={`軸 ${index + 1} の名前（例：おいしさ）`}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  />
                </div>

                {axes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAxis(axis.id)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded border border-red-200"
                    disabled={loading}
                  >
                    削除
                  </button>
                )}
              </div>
            ))}
          </div>

          {axes.length < 10 && (
            <button
              type="button"
              onClick={addAxis}
              className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 border border-blue-300"
              disabled={loading}
            >
              + 評価軸を追加
            </button>
          )}

          <p className="mt-2 text-sm text-gray-600">
            評価軸: {axes.length}/10
          </p>
        </div>

        {/* 軸全体の最高得点 */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            軸全体の最高得点 <span className="text-red-500">*</span>
          </label>
          <select
            value={maxScore}
            onChange={(e) => setMaxScore(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            {[...Array(10)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1} 点
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-600">
            各評価軸の最高得点を選択してください
          </p>
        </div>

        {/* ボタン */}
        <div className="flex gap-3 pt-6 border-t">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold"
          >
            {loading ? "作成中..." : "作成する"}
          </button>

          <Link
            href="/ranking/index"
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center font-semibold"
          >
            戻る
          </Link>
        </div>
      </form>
    </main>
  );
}
