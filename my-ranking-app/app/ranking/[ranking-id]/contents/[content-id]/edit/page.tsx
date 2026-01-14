"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Axis {
  id: string;
  name: string;
  order: number;
}

interface Rating {
  axisId: string;
  score: number;
}

type Params = { "ranking-id": string; "content-id": string };

export default function EditContentPage({ params }: { params: Promise<Params> }) {
  const [rankingId, setRankingId] = useState("");
  const [contentId, setContentId] = useState("");
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [comment, setComment] = useState("");
  const [externalLink, setExternalLink] = useState("");
  const [axes, setAxes] = useState<Axis[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [maxScore, setMaxScore] = useState(5);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  // paramsから値を取得
  useEffect(() => {
    const initializeParams = async () => {
      const { "ranking-id": id, "content-id": cId } = await params;
      setRankingId(id);
      setContentId(cId);
    };
    initializeParams();
  }, [params]);

  // コンテンツとランキング情報を取得
  useEffect(() => {
    if (!rankingId || !contentId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [rankingRes, contentRes] = await Promise.all([
          fetch(`/api/ranking/${rankingId}`),
          fetch(`/api/ranking/${rankingId}/contents/${contentId}`),
        ]);

        if (!rankingRes.ok || !contentRes.ok) {
          throw new Error("データの取得に失敗しました");
        }

        const ranking = await rankingRes.json();
        const content = await contentRes.json();

        setMaxScore(ranking.maxScore || 5);

        // 軸を取得して並べ替え
        const sortedAxes = ranking.Axis.sort(
          (a: Axis, b: Axis) => a.order - b.order
        );
        setAxes(sortedAxes);

        // コンテンツ情報を設定
        setTitle(content.title);
        setDescription(content.description || "");
        setImage(content.image || "");
        setImagePreview(content.image || "");

        // コメントからリンク部分を削除
        let commentWithoutLink = content.comment || "";
        if (commentWithoutLink.includes("リンク:")) {
          commentWithoutLink = commentWithoutLink
            .split("\n")
            .filter((line: string) => !line.includes("リンク:"))
            .join("\n")
            .trim();
        }
        setComment(commentWithoutLink);

        // リンクを抽出
        if (content.comment && content.comment.includes("リンク:")) {
          const linkMatch = content.comment.match(/リンク:\s*(.+?)(?:\n|$)/);
          if (linkMatch) {
            setExternalLink(linkMatch[1].trim());
          }
        }

        // 評価を設定
        const ratingMap = new Map(
          content.Rating?.map((r: any) => [r.axisId, r.score]) || []
        );

        const initialRatings = sortedAxes.map((axis: Axis) => ({
          axisId: axis.id,
          score: ratingMap.get(axis.id) || 0,
        }));
        setRatings(initialRatings);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "エラーが発生しました"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [rankingId, contentId]);

  // 画像ドロップ
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageFile(files[0]);
    }
  };

  // ファイル選択
  const handleImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("画像ファイルを選択してください");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImage(result);
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  };

  // 評価の更新
  const updateRating = (axisId: string, score: number) => {
    setRatings((prev) =>
      prev.map((r) => (r.axisId === axisId ? { ...r, score } : r))
    );
  };

  // フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!rankingId || !contentId) {
      setError("ランキングまたはコンテンツIDが取得できません");
      return;
    }

    if (!title.trim()) {
      setError("コンテンツ名は必須です");
      return;
    }

    try {
      setSaveLoading(true);

      const response = await fetch(
        `/api/ranking/${rankingId}/contents/${contentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim() || null,
            image: image || null,
            comment: comment.trim() || null,
            externalLink: externalLink.trim() || null,
            ratings,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "コンテンツの更新に失敗しました");
      }

      router.push(`/ranking/${rankingId}/index`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "エラーが発生しました"
      );
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="p-6 max-w-3xl mx-auto">
        <div className="text-center text-gray-500">読み込み中...</div>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">コンテンツ編集</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* コンテンツ名 */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            コンテンツ名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例：ラーメン太郎"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            disabled={saveLoading}
          />
        </div>

        {/* コンテンツ画像 */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            コンテンツ画像
          </label>

          {imagePreview && (
            <div className="mb-4">
              <img
                src={imagePreview}
                alt="プレビュー"
                className="max-w-sm max-h-64 rounded-lg border border-gray-300"
              />
              <button
                type="button"
                onClick={() => {
                  setImage("");
                  setImagePreview("");
                }}
                className="mt-2 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                disabled={saveLoading}
              >
                画像を削除
              </button>
            </div>
          )}

          <div
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 hover:bg-gray-100 cursor-pointer transition"
          >
            <input
              type="file"
              id="image-input"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleImageFile(e.target.files[0]);
                }
              }}
              className="hidden"
              disabled={saveLoading}
            />

            <label htmlFor="image-input" className="cursor-pointer">
              <div className="text-2xl mb-2">🖼️</div>
              <p className="font-semibold text-gray-700">
                画像をドロップするか、クリックして選択
              </p>
              <p className="text-sm text-gray-500 mt-1">
                対応形式: JPG, PNG, GIF など
              </p>
            </label>
          </div>
        </div>

        {/* コンテンツ説明 */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            コンテンツ説明
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="このコンテンツについての説明を入力してください（オプション）"
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            disabled={saveLoading}
          />
        </div>

        {/* 評価 */}
        {axes.length > 0 && (
          <div>
            <label className="block text-sm font-semibold mb-4">評価</label>

            <div className="space-y-5">
              {axes.map((axis) => {
                const rating = ratings.find((r) => r.axisId === axis.id);
                const score = rating?.score || 0;

                return (
                  <div key={axis.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex justify-between mb-3">
                      <label className="font-semibold text-gray-700">
                        {axis.name}
                      </label>
                      <span className="text-lg font-bold text-blue-600">
                        {score} / {maxScore}
                      </span>
                    </div>

                    {/* カスタムスライダー */}
                    <div className="relative mb-2">
                      <input
                        type="range"
                        min="0"
                        max={maxScore}
                        value={score}
                        onChange={(e) =>
                          updateRating(axis.id, Number(e.target.value))
                        }
                        className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(score / maxScore) * 100}%, #d1d5db ${(score / maxScore) * 100}%, #d1d5db 100%)`
                        }}
                        disabled={saveLoading}
                      />
                    </div>

                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0</span>
                      <span>{maxScore}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* コンテンツ備考 */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            コンテンツ備考
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="コンテンツに関するメモや備考（オプション）"
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            disabled={saveLoading}
          />
        </div>

        {/* リンク貼り付け欄 */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            外部リンク
          </label>
          <input
            type="url"
            value={externalLink}
            onChange={(e) => setExternalLink(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            disabled={saveLoading}
          />
          <p className="mt-1 text-sm text-gray-600">
            コンテンツ詳細画面からこのリンクにアクセスできます
          </p>
        </div>

        {/* ボタン */}
        <div className="flex gap-3 pt-6 border-t">
          <button
            type="submit"
            disabled={saveLoading}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold"
          >
            {saveLoading ? "保存中..." : "保存する"}
          </button>

          <Link
            href={`/ranking/${rankingId}/index`}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center font-semibold"
          >
            キャンセル
          </Link>
        </div>
      </form>
    </main>
  );
}
