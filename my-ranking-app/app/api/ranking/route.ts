import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// POST: ランキングを作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, maxScore, axes } = body;

    // バリデーション
    if (!title || !Array.isArray(axes) || axes.length === 0) {
      return NextResponse.json(
        { error: "タイトルと評価軸は必須です" },
        { status: 400 }
      );
    }

    // ランキングを作成
    const ranking = await prisma.ranking.create({
      data: {
        title,
        description: description || null,
        maxScore: maxScore || 5,
        Axis: {
          create: axes.map((axis: any, index: number) => ({
            id: `${Date.now()}-${index}`,
            name: axis.name,
            order: index,
          })),
        },
      },
    });

    return NextResponse.json(ranking, { status: 201 });
  } catch (error) {
    console.error("ランキング作成エラー:", error);
    return NextResponse.json(
      { error: "ランキングの作成に失敗しました" },
      { status: 500 }
    );
  }
}
