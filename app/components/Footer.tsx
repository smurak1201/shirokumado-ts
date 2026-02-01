/**
 * フッターコンポーネント (app/components/Footer.tsx)
 *
 * 全ページ共通のフッターです。
 * 店舗情報、連絡先、Googleマップを含みます。
 *
 * 主な機能:
 * - ロゴと Instagram へのリンク
 * - 店舗情報の表示（住所、営業時間、定休日、電話番号）
 * - Google マップの埋め込み
 * - コピーライト表示
 * - レスポンシブ対応（4列グリッドレイアウト）
 *
 * 実装の特性:
 * - Server Component（静的なコンテンツのみ）
 * - shadcn/ui の Card, Separator, AspectRatio を使用
 * - セキュリティ対応（iframe の sandbox 属性）
 *
 * ベストプラクティス:
 * - 電話番号は tel: リンクでモバイル対応
 * - 外部リンクは rel="noopener noreferrer" でセキュリティ対策
 * - Google マップは lazy 読み込みでパフォーマンス最適化
 */
import Image from "next/image";
import Link from "next/link";
import { Separator } from "./ui/separator";
import { Card, CardHeader } from "./ui/card";
import { AspectRatio } from "./ui/aspect-ratio";
import { cn } from "@/lib/utils";

/**
 * フッターコンポーネント
 *
 * 全ページ共通のフッターを表示します。
 * 4列グリッドレイアウトで店舗情報を整理して表示します。
 *
 * 構成要素:
 * - ロゴ + Instagram アイコン
 * - 住所
 * - 営業情報（営業時間、定休日）
 * - お問い合わせ（電話番号）
 * - Google マップ
 * - コピーライト
 */
export default function Footer() {
  return (
    <footer className="border-t border-border bg-linear-to-b from-background to-muted/20 py-12 md:py-16 lg:py-20 overflow-x-hidden">
      {/*
       * フッターコンテナ
       * max-w-6xl: コンテンツ幅の最大値を制限（読みやすさの確保）
       * レスポンシブパディング: モバイル(px-2) → タブレット(px-4) → デスクトップ(px-12)
       * 理由: 画面サイズに応じて適切な余白を確保し、情報を見やすく配置
       */}
      <div className="mx-auto max-w-6xl px-2 sm:px-4 md:px-6 lg:px-12">
        {/*
         * ロゴ + SNS アイコンセクション
         * mb-8: 下の店舗情報グリッドとの視覚的な分離
         * gap: レスポンシブに調整（モバイル3 → デスクトップ5）
         * 理由: ブランド認知とSNSへの誘導を最優先で配置
         */}
        <div className="mb-8 flex items-center gap-3 sm:gap-4 md:gap-5">
          {/*
           * ロゴリンク
           * トップページへのナビゲーション機能を兼ねる
           * ホバー効果: opacity-80（少し透過）+ scale-105（5%拡大）
           * アクティブ効果: scale-95（5%縮小）でクリック感を演出
           * focus-visible: キーボードナビゲーション対応（アクセシビリティ）
           */}
          <Link
            href="/"
            className="transition-all hover:opacity-80 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
          >
            {/*
             * ロゴ画像
             * next/image を使用（自動最適化、WebP対応、遅延読み込み）
             * width/height: アスペクト比を維持しつつ、CLS（Cumulative Layout Shift）を防止
             * style: width固定 + height:auto でレスポンシブ対応
             */}
            <Image
              src="/logo.webp"
              alt="白熊堂"
              width={120}
              height={45}
              style={{ width: "120px", height: "auto" }}
            />
          </Link>
          {/*
           * Instagram リンク
           * target="_blank": 新しいタブで開く（ユーザーがサイトから離れても戻りやすい）
           * rel="noopener noreferrer": セキュリティ対策
           *   - noopener: 新しいタブがwindow.openerにアクセスできないようにする（タブナビング攻撃防止）
           *   - noreferrer: リファラー情報を送信しない（プライバシー保護）
           * aria-label: スクリーンリーダー対応（アイコンのみなのでテキストで説明）
           * ホバー効果: bg-accent（背景色）+ scale-110（10%拡大）で視覚的フィードバック
           */}
          <a
            href="https://www.instagram.com/shirokumado2021/"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex items-center justify-center rounded-full p-2 transition-all",
              "hover:bg-accent hover:scale-110 active:scale-95",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            )}
            aria-label="Instagram"
          >
            {/*
             * Instagram アイコン
             * レスポンシブサイズ: モバイル(5) → タブレット(6) → デスクトップ(7)
             * 理由: 画面サイズに応じて適切なタップ/クリック領域を確保（UX向上）
             */}
            <Image
              src="/logo-instagram.svg"
              alt="Instagram"
              width={24}
              height={24}
              className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7"
            />
          </a>
        </div>

        {/*
         * 店舗情報グリッドレイアウト
         * grid-cols-4: 4列均等配置（住所、営業情報、お問い合わせ、地図）
         * gap: モバイル(1) → デスクトップ(6)
         * 理由: モバイルでは画面幅が狭いため最小限のgapで情報を詰める
         *       デスクトップでは余裕を持たせて視認性を向上
         * 注意: 4列レイアウトはモバイルでも維持（text-[8px]で小さくしてでも全情報を表示）
         */}
        <div className="grid grid-cols-4 gap-1 md:gap-6">
          {/*
           * 住所セクション（1列目）
           * space-y: 見出しと本文の間隔（モバイル1 → デスクトップ3）
           */}
          <div className="space-y-1 md:space-y-3">
            {/*
             * 見出し
             * text-[8px]: モバイルでは極小フォント（4列を確保するため）
             * md:text-sm: デスクトップでは通常サイズ
             * uppercase + tracking-wider: 英字の場合の視認性向上（今回は日本語なので効果は限定的）
             */}
            <h3 className="text-[8px] font-normal uppercase tracking-wider text-foreground md:text-sm">
              住所
            </h3>
            {/*
             * 住所本文
             * space-y-0.5: 行間を詰めて2行を1つのまとまりとして表示
             * leading-relaxed: 行間を少し広げて可読性を確保
             * text-muted-foreground: 見出しより控えめな色で階層を表現
             */}
            <div className="space-y-0.5 text-[8px] leading-relaxed text-muted-foreground md:text-sm">
              <p>神奈川県川崎市川崎区小川町4-1</p>
              <p>ラチッタデッラ マッジョーレ1F</p>
            </div>
          </div>

          {/*
           * 営業情報セクション（2列目）
           * 営業時間と定休日の2つの情報をグループ化
           */}
          <div className="space-y-1 md:space-y-3">
            <h3 className="text-[8px] font-normal uppercase tracking-wider text-foreground md:text-sm">
              営業情報
            </h3>
            {/*
             * 営業時間・定休日のコンテナ
             * space-y-1: 各情報ブロック間に最小限の間隔を確保
             */}
            <div className="space-y-1 text-[8px] leading-relaxed text-muted-foreground md:text-sm">
              {/*
               * 営業時間ブロック
               * font-medium + text-foreground/90: ラベルを強調（90%不透明度で柔らかく）
               * 理由: 「営業時間」というラベルと「11:00～21:00」という値を視覚的に区別
               */}
              <div>
                <p className="font-medium text-foreground/90">営業時間</p>
                <p>11:00～21:00(L.O.20:00)</p>
              </div>
              {/* 定休日ブロック（営業時間と同じ構造） */}
              <div>
                <p className="font-medium text-foreground/90">定休日</p>
                <p>通年営業 月1回不定休</p>
              </div>
            </div>
          </div>

          {/*
           * お問い合わせセクション（3列目）
           * 電話番号をクリック/タップ可能にすることでモバイルからの発信を簡単に
           */}
          <div className="space-y-1 md:space-y-3">
            <h3 className="text-[8px] font-normal uppercase tracking-wider text-foreground md:text-sm">
              お問い合わせ
            </h3>
            <div className="space-y-0.5 text-[8px] leading-relaxed text-muted-foreground md:text-sm">
              {/*
               * 電話番号リンク
               * href="tel:xxx": モバイルでタップすると電話アプリが起動（UX向上）
               * block: リンク領域を広げてクリック/タップしやすく
               * font-medium: 他のテキストより強調（アクション可能であることを示唆）
               * hover:text-foreground: ホバー時に色を濃くしてインタラクティブ性を示す
               * active:scale-95: クリック/タップ時に縮小してフィードバック
               */}
              <a
                href="tel:070-9157-3772"
                className={cn(
                  "block font-medium transition-all active:scale-95",
                  "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
                )}
              >
                070-9157-3772
              </a>
            </div>
          </div>

          {/*
           * Google マップセクション（4列目）
           * ユーザーが店舗の場所を視覚的に確認できる
           */}
          <div>
            {/*
             * カードコンポーネント（shadcn/ui）
             * overflow-hidden: 角丸の境界からiframeがはみ出さないように
             * border-border/60: 透明度60%で柔らかい印象
             * transition-all duration-500: ホバー時などのアニメーション用（現在未使用だが拡張性確保）
             */}
            <Card className="overflow-hidden border-border/60 transition-all duration-500">
              {/*
               * CardHeader（padding: 0）
               * 理由: iframeをカード全体に敷き詰めたいため、デフォルトのpaddingを削除
               */}
              <CardHeader className="p-0">
                {/*
                 * AspectRatio（4:3）
                 * 理由: 地図の縦横比を固定してレイアウト崩れを防止
                 * CLS（Cumulative Layout Shift）対策: 読み込み前から領域を確保
                 */}
                <AspectRatio ratio={4 / 3} className="overflow-hidden">
                  {/*
                   * Google マップ iframe
                   * src: Google Maps Embed API（検索クエリ「かき氷 白熊堂」で表示）
                   * loading="lazy": 遅延読み込みでページ初期表示のパフォーマンス向上
                   *   理由: フッターはファーストビューの外にあるため、必要になってから読み込む
                   * referrerPolicy="no-referrer-when-downgrade": リファラー送信ポリシー
                   *   理由: HTTPSからHTTPへの遷移時のみリファラーを送らない（通常のHTTPS通信では送信）
                   * allowFullScreen: 全画面表示を許可（ユーザーが地図を拡大して見られる）
                   * title: スクリーンリーダー対応（iframeの内容を説明）
                   *
                   * sandbox属性: セキュリティ対策（XSS攻撃などを防止）
                   *   - allow-scripts: Google Mapsの機能に必要なJavaScriptを許可
                   *   - allow-same-origin: 同一オリジンでの動作を許可（地図の操作に必要）
                   *   - allow-popups: ポップアップを許可（「Googleマップで開く」リンクなど）
                   *   - allow-popups-to-escape-sandbox: ポップアップがsandbox制約を受けないように
                   * 注意: sandbox属性を設定しないと、埋め込まれたコンテンツが親ページを操作できる可能性
                   */}
                  <iframe
                    src="https://www.google.com/maps?q=かき氷 白熊堂&output=embed"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="白熊堂の場所"
                    className="h-full w-full"
                    sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                  />
                </AspectRatio>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/*
         * 区切り線
         * my-12: 上下に大きめの余白を確保（店舗情報とコピーライトを明確に分離）
         * 理由: フッター内でもセクションごとに視覚的な区切りを付けて情報を整理
         */}
        <Separator className="my-12" />
        {/*
         * コピーライトセクション
         * text-center: 中央揃え（フッターの慣習的な配置）
         * text-xs: 小さめのフォントサイズ（主要情報ではないため）
         * text-muted-foreground: 控えめな色で背景に溶け込むように
         */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">© 2024 白熊堂</p>
        </div>
      </div>
    </footer>
  );
}
