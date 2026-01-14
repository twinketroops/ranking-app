import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET: ランキング詳細を取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ "ranking-id": string }> }
) {
  try {
    const { "ranking-id": rankingId } = await params;

    const ranking = await prisma.ranking.findUnique({
      where: { id: rankingId },
      include: {
        Axis: {
          orderBy: { order: "asc" },
        },
        contents: {
          include: {
            Rating: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!ranking) {
      return NextResponse.json(
        { error: "ランキングが見つかりません" },
        { status: 404 }
      );
    }

    return NextResponse.json(ranking);
  } catch (error) {
    console.error("ランキング取得エラー:", error);
    return NextResponse.json(
      { error: "ランキングの取得に失敗しました" },
      { status: 500 }
    );
  }
}
