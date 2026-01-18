import Header from "../components/Header";
import Footer from "../components/Footer";
import { Card, CardHeader, CardContent, CardTitle } from "../components/ui/card";
import { Separator } from "../components/ui/separator";

/**
 * FAQページのメインコンポーネント
 *
 * よくある質問と回答を一覧表示します。
 *
 * Server Component として実装されており、静的なコンテンツを表示します。
 * 質問と回答のデータはコンポーネント内で定義されています。
 *
 * レイアウト構成：
 * - ヘッダー: ロゴ、Instagramリンク、ナビゲーション
 * - メインコンテンツ: FAQ一覧（質問と回答）
 * - フッター: 店舗情報、地図、連絡先
 */
export default function FAQPage() {
  /**
   * FAQデータ
   * 質問と回答のペアを配列で定義
   * 各FAQには一意のIDを付与して、JSXのkeyとして使用します
   */
  const faqs = [
    {
      id: "faq-1",
      question: "かき氷の販売は夏だけですか？",
      answer:
        "通年で営業しており、季節ごとに異なるメニューもご用意しています。",
    },
    {
      id: "faq-2",
      question: "予約は出来ますか？",
      answer:
        "ご予約は承っておりませんが、状況に応じて順にご案内しております。混み合う時間帯はお待ちいただく場合がございますので、あらかじめご了承ください。なお、グループでのご来店の場合は、皆さまがおそろいになってからのご案内とさせていただいております。",
    },
    {
      id: "faq-3",
      question: "定休日はありますか？",
      answer:
        "月に１回、不定休を設けています。最新の営業情報はInstagramでお知らせしています。",
    },
    {
      id: "faq-4",
      question: "営業時間を教えてください。",
      answer:
        "１１：００～２１：００で営業しております。ラストオーダーは２０：００です。",
    },
    {
      id: "faq-5",
      question: "席は先に確保できますか？",
      answer:
        "恐れ入りますが、事前に席をお取りいただくことはご遠慮いただいております。皆さまが快適にお過ごしいただけますよう、ご理解とご協力のほどよろしくお願い申し上げます。",
    },
    {
      id: "faq-6",
      question: "席の利用時間に制限はありますか？",
      answer:
        "当店では、ゆっくりとお食事をお楽しみいただけるよう努めておりますが、混雑時には、お食事がお済みのお客さまへお声がけをさせていただく場合がございます。席をお待ちのお客さまがいらっしゃる際には、ご協力いただけますと幸いです。",
    },
    {
      id: "faq-7",
      question: "会計はいつ行えばよいですか？",
      answer:
        "当店では、レジにて先にご注文とお会計を済ませていただいた後にお席へご案内しております。",
    },
    {
      id: "faq-8",
      question: "会計は現金のみですか？",
      answer:
        "当店では、キャッシュレス決済に対応しております。クレジットカード、交通系IC、各種QRコード決済をご利用いただけます。",
    },
    {
      id: "faq-9",
      question: "人数分の注文は必要ですか？",
      answer:
        "恐れ入りますが、当店ではお一人につき1点以上のご注文をお願いしております。お席のご利用にあたって、皆さまに気持ちよくお過ごしいただけるよう、ご協力をお願い申し上げます。また、小さなお子さまや体調・ご事情などでご注文が難しい場合は、どうぞ遠慮なくスタッフまでご相談くださいませ。",
    },
    {
      id: "faq-10",
      question: "店内でお水の提供はありますか？",
      answer:
        "当店では店内でのお冷のご提供は行っておりません。そのため、飲み物のお持ち込みは歓迎しております。ただし、食事の持ち込みはご遠慮いただいておりますので、あらかじめご了承いただけますと幸いです。",
    },
    {
      id: "faq-11",
      question: "電話がつながらないことがあるのですが、どうすればいいですか？",
      answer:
        "混雑時など店舗の状況により、電話にすぐ対応できない場合がございます。お急ぎの場合は、少し時間を空けて再度おかけ直しいただけますと幸いです。",
    },
    {
      id: "faq-12",
      question: "お問合せ方法を教えてください",
      answer:
        "お問合せにつきましては、お電話または白熊堂のInstagramアカウントよりご連絡いただけますようお願いいたします。",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <Header />

      {/* メインコンテンツ */}
      <main className="mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-12 lg:px-8 lg:py-16">
        {/* ページタイトル */}
        <div className="mb-10 flex flex-col items-center gap-4 md:mb-12">
          <h1 className="text-center text-2xl font-bold text-foreground md:text-3xl lg:text-4xl">
            よくある質問
          </h1>
          <Separator className="w-20 md:w-32" />
        </div>

        {/* FAQ一覧 */}
        <div className="space-y-4 md:space-y-6">
          {faqs.map((faq) => (
            <Card
              key={faq.id}
              className="transition-all duration-300 hover:shadow-md hover:border-primary/20"
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-foreground md:text-lg">
                  {faq.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                  {faq.answer}
                </p>
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
