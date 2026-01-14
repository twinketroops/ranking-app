import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET: コンテンツを取得
export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ "ranking-id": string; "content-id": string }>;
  }
) {
  try {
    const { "content-id": contentId } = await params;

    const content = await prisma.content.findUnique({
      where: { id: contentId },
      include: {
        Rating: true,
      },
    });

    if (!content) {
      return NextResponse.json(
        { error: "コンテンツが見つかりません" },
        { status: 404 }
      );
    }

    return NextResponse.json(content);
  } catch (error) {
    console.error("コンテンツ取得エラー:", error);
    return NextResponse.json(
      { error: "コンテンツの取得に失敗しました" },
      { status: 500 }
    );
  }
}

// PUT: コンテンツを更新
export async function PUT(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ "ranking-id": string; "content-id": string }>;
  }
) {
  try {
    const { "content-id": contentId } = await params;
    const body = await request.json();
    const { title, description, image, comment, ratings, externalLink } = body;

    // バリデーション
    if (!title) {
      return NextResponse.json(
        { error: "コンテンツ名は必須です" },
        { status: 400 }
      );
    }

    // コンテンツが存在するか確認
    const existingContent = await prisma.content.findUnique({
      where: { id: contentId },
    });

    if (!existingContent) {
      return NextResponse.json(
        { error: "コンテンツが見つかりません" },
        { status: 404 }
      );
    }

    // コンテンツを更新
    let commentValue = comment || null;

    // 既存のリンク部分を削除
    if (commentValue && commentValue.includes("リンク:")) {
      commentValue = commentValue
        .split("\n")
        .filter((line) => !line.includes("リンク:"))
        .join("\n")
        .trim();
      if (!commentValue) {
        commentValue = null;
      }
    }

    // externalLink がある場合、comment に追加
    if (externalLink) {
      commentValue = commentValue
        ? `${commentValue}\n\nリンク: ${externalLink}`
        : `リンク: ${externalLink}`;
    }

    const updatedContent = await prisma.content.update({
      where: { id: contentId },
      data: {
        title,
        description: description || null,
        image: image || null,
        comment: commentValue,
      },
    });

    // 既存の Rating を削除
    await prisma.rating.deleteMany({
      where: { contentId: contentId },
    });

    // 新しい Rating を作成
    await Promise.all(
      (ratings || []).map((rating: any) =>
        prisma.rating.create({
          data: {
            id: `${Date.now()}-${rating.axisId}`,
            contentId,
            axisId: rating.axisId,
            score: rating.score,
          },
        })
      )
    );

    // 更新後のコンテンツを取得
    const finalContent = await prisma.content.findUnique({
      where: { id: contentId },
      include: {
        Rating: true,
      },
    });

    return NextResponse.json(finalContent, { status: 200 });
  } catch (error) {
    console.error("コンテンツ更新エラー:", error);
    return NextResponse.json(
      { error: "コンテンツの更新に失敗しました" },
      { status: 500 }
    );
  }
}

// DELETE: コンテンツを削除
export async function DELETE(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ "ranking-id": string; "content-id": string }>;
  }
) {
  try {
    const { "content-id": contentId } = await params;

    // Rating を削除
    await prisma.rating.deleteMany({
      where: { contentId: contentId },
    });

    // コンテンツを削除
    await prisma.content.delete({
      where: { id: contentId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("コンテンツ削除エラー:", error);
    return NextResponse.json(
      { error: "コンテンツの削除に失敗しました" },
      { status: 500 }
    );
  }
}
