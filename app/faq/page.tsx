import Header from "../components/Header";
import Footer from "../components/Footer";

/**
 * FAQページのメインコンポーネント
 */
export default function FAQPage() {
  const faqs = [
    {
      question: "かき氷の販売は夏だけですか？",
      answer:
        "通年で営業しており、季節ごとに異なるメニューもご用意しています。",
    },
    {
      question: "予約は出来ますか？",
      answer:
        "ご予約は承っておりませんが、状況に応じて順にご案内しております。混み合う時間帯はお待ちいただく場合がございますので、あらかじめご了承ください。なお、グループでのご来店の場合は、皆さまがおそろいになってからのご案内とさせていただいております。",
    },
    {
      question: "定休日はありますか？",
      answer:
        "月に１回、不定休を設けています。最新の営業情報はInstagramでお知らせしています。",
    },
    {
      question: "営業時間を教えてください。",
      answer:
        "１１：００～２１：００で営業しております。ラストオーダーは２０：００です。",
    },
    {
      question: "席は先に確保できますか？",
      answer:
        "恐れ入りますが、事前に席をお取りいただくことはご遠慮いただいております。皆さまが快適にお過ごしいただけますよう、ご理解とご協力のほどよろしくお願い申し上げます。",
    },
    {
      question: "席の利用時間に制限はありますか？",
      answer:
        "当店では、ゆっくりとお食事をお楽しみいただけるよう努めておりますが、混雑時には、お食事がお済みのお客さまへお声がけをさせていただく場合がございます。席をお待ちのお客さまがいらっしゃる際には、ご協力いただけますと幸いです。",
    },
    {
      question: "会計はいつ行えばよいですか？",
      answer:
        "当店では、レジにて先にご注文とお会計を済ませていただいた後にお席へご案内しております。",
    },
    {
      question: "会計は現金のみですか？",
      answer:
        "当店では、キャッシュレス決済に対応しております。クレジットカード、交通系IC、各種QRコード決済をご利用いただけます。",
    },
    {
      question: "人数分の注文は必要ですか？",
      answer:
        "恐れ入りますが、当店ではお一人につき1点以上のご注文をお願いしております。お席のご利用にあたって、皆さまに気持ちよくお過ごしいただけるよう、ご協力をお願い申し上げます。また、小さなお子さまや体調・ご事情などでご注文が難しい場合は、どうぞ遠慮なくスタッフまでご相談くださいませ。",
    },
    {
      question: "店内でお水の提供はありますか？",
      answer:
        "当店では店内でのお冷のご提供は行っておりません。そのため、飲み物のお持ち込みは歓迎しております。ただし、食事の持ち込みはご遠慮いただいておりますので、あらかじめご了承いただけますと幸いです。",
    },
    {
      question: "電話がつながらないことがあるのですが、どうすればいいですか？",
      answer:
        "混雑時など店舗の状況により、電話にすぐ対応できない場合がございます。お急ぎの場合は、少し時間を空けて再度おかけ直しいただけますと幸いです。",
    },
    {
      question: "お問合せ方法を教えてください",
      answer:
        "お問合せにつきましては、お電話または白熊堂のInstagramアカウントよりご連絡いただけますようお願いいたします。",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <Header />

      {/* メインコンテンツ */}
      <main className="mx-auto max-w-4xl px-4 py-8 md:px-8 md:py-12 lg:px-12 lg:py-16">
        <h1 className="mb-8 text-2xl font-bold text-gray-900 md:text-3xl lg:text-4xl">
          よくある質問
        </h1>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border-b border-gray-200 pb-6 last:border-b-0"
            >
              <h2 className="mb-3 text-lg font-semibold text-gray-900 md:text-xl">
                {faq.question}
              </h2>
              <p className="text-sm leading-relaxed text-gray-700 md:text-base">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* フッター */}
      <Footer />
    </div>
  );
}
