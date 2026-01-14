import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET: ランキングのコンテンツ一覧を取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ "ranking-id": string }> }
) {
  try {
    const { "ranking-id": rankingId } = await params;

    const contents = await prisma.content.findMany({
      where: { rankingId },
      include: {
        Rating: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(contents);
  } catch (error) {
    console.error("コンテンツ取得エラー:", error);
    return NextResponse.json(
      { error: "コンテンツの取得に失敗しました" },
      { status: 500 }
    );
  }
}

// POST: コンテンツを作成
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ "ranking-id": string }> }
) {
  try {
    const { "ranking-id": rankingId } = await params;
    const body = await request.json();
    const { title, description, image, comment, ratings, externalLink } = body;

    // バリデーション
    if (!title) {
      return NextResponse.json(
        { error: "コンテンツ名は必須です" },
        { status: 400 }
      );
    }

    // ランキングが存在するか確認
    const ranking = await prisma.ranking.findUnique({
      where: { id: rankingId },
    });

    if (!ranking) {
      return NextResponse.json(
        { error: "ランキングが見つかりません" },
        { status: 404 }
      );
    }

    // コンテンツを作成
    const content = await prisma.content.create({
      data: {
        rankingId,
        title,
        description: description || null,
        image: image || null,
        comment: comment || null,
        Rating: {
          create: (ratings || []).map((rating: any) => ({
            id: `${Date.now()}-${rating.axisId}`,
            axisId: rating.axisId,
            score: rating.score,
          })),
        },
      },
      include: {
        Rating: true,
      },
    });

    // externalLink を保存する場合は、comment に追加
    if (externalLink) {
      const updatedContent = await prisma.content.update({
        where: { id: content.id },
        data: {
          comment: comment ? `${comment}\n\nリンク: ${externalLink}` : `リンク: ${externalLink}`,
        },
        include: {
          Rating: true,
        },
      });
      return NextResponse.json(updatedContent, { status: 201 });
    }

    return NextResponse.json(content, { status: 201 });
  } catch (error) {
    console.error("コンテンツ作成エラー:", error);
    return NextResponse.json(
      { error: "コンテンツの作成に失敗しました" },
      { status: 500 }
    );
  }
}
