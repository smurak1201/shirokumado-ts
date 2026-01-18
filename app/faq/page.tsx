import Header from "../components/Header";
import Footer from "../components/Footer";
import { Card, CardHeader, CardContent, CardTitle } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { Badge } from "../components/ui/badge";
import { faqs } from "./data";

/**
 * FAQページのメインコンポーネント
 *
 * よくある質問と回答を一覧表示します。
 *
 * Server Component として実装されており、静的なコンテンツを表示します。
 * 質問と回答のデータは `data.ts` から取得します。
 *
 * レイアウト構成：
 * - ヘッダー: ロゴ、Instagramリンク、ナビゲーション
 * - メインコンテンツ: FAQ一覧（質問と回答）
 * - フッター: 店舗情報、地図、連絡先
 */
export default function FAQPage() {

  return (
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <Header />
      {/* ヘッダーの高さ分のスペーサー */}
      <div className="h-20" />

      {/* メインコンテンツ */}
      <main className="mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-12 lg:px-8 lg:py-16">
        {/* ページタイトル */}
        <div className="mb-10 flex flex-col items-center gap-4 md:mb-12">
          <h1 className="text-center text-2xl font-normal tracking-wide text-muted-foreground md:text-3xl lg:text-4xl">
            よくある質問
          </h1>
          <Separator className="w-20 md:w-32" />
        </div>

        {/* FAQ一覧 */}
        <div className="space-y-4 md:space-y-6">
          {faqs.map((faq, index) => (
            <Card
              key={faq.question}
              className="group relative overflow-hidden border-border/60 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/30"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3 md:gap-4">
                  {/* 質問番号をBadgeで表示 */}
                  <Badge
                    variant="secondary"
                    className="mt-0.5 shrink-0 text-xs font-bold md:text-sm"
                  >
                    Q{index + 1}
                  </Badge>
                  <CardTitle className="flex-1 text-base font-normal leading-relaxed text-foreground transition-colors duration-300 group-hover:text-primary md:text-lg">
                    {faq.question}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="ml-0 md:ml-8">
                  <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                    {faq.answer}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* フッター */}
      <Footer />
    </div>
  );
}
