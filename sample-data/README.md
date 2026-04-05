# レジCSVデータ仕様

CASIOレジ（SR500/550/4000）のSDカードから出力されるCSVデータの仕様と、
DB取り込みに関する設計をまとめる。

## CSVファイル仕様

### ディレクトリ構造

```
XZ_BKUP/{年}/{月}/
```

### ファイル名フォーマット

```
Z{種別コード}_{日} _{連番}.CSV
```

例: `Z001_16 _0001.CSV` = 売上明細 / 16日 / 連番0001

- エンコーディング: Shift_JIS
- 日付部分の後にスペースが入る（例: `_16 _`）
- 同日に複数回精算がある場合、末尾に「A」が付き連番が増える（例: `Z002_30A_0002.CSV`）

### 種別コード一覧

| コード | 内容 | ファイル数 |
| ------ | ------------ | ---------- |
| Z001   | 売上明細     | 1,484件    |
| Z002   | 取引キー     | 1,484件    |
| Z004   | PLU（商品）  | 1,480件    |
| Z005   | 部門         | 1,484件    |
| Z006   | グループ     | 3件        |
| Z009   | 時間帯別     | 1,475件    |
| Z011   | 担当者       | 0件        |

※ Z006（グループ）、Z011（担当者）はデータが少ないため対象外

### 共通メタデータ（行1-6）

すべてのファイルで共通:

```
マシンNo. / ファイル名 / モード / 精算回数 / 日付 / 時刻
```

### 各種別のデータ構造

#### Z001（売上明細）

- カラム: レコード, キャラクター, 個数/件数, 金額
- 行数: 28行（固定）
- 内容: 総売、純売、現金在高、税金など日次の売上集計
- 除外: なし（全行登録）

#### Z002（取引キー）

- カラム: レコード, キャラクター, 個数/件数, 金額
- 行数: 50行（固定）
- 内容: 現金、クレジット、商品券などの取引方法別集計
- 除外: キャラクターが空白の行

#### Z004（PLU/商品）

- カラム: レコード, PLUコード, キャラクター, 個数, 金額
- 行数: 約2,500行（登録対象は1日あたり約16行）
- 内容: 商品ごとの売上集計
- 除外: 個数・金額ともに0の行

#### Z005（部門）

- カラム: レコード, キャラクター, 個数, 金額
- 行数: 21行（固定）
- 内容: 部門別の売上集計（部門01〜部門20 + ノンリンク）
- 除外: 個数・金額ともに0の行

#### Z009（時間帯別）

- カラム: レコード, 開始時刻, 終了時刻, 件数, 金額
- 行数: 24行（固定、1時間ごと 00:00〜24:00）
- 内容: 時間帯別の売上集計
- 除外: 件数・金額ともに0の行

### データ範囲

- 期間: 2021/10 - 2026/03（全54か月分）

---

## DB設計

### ユニークキー

マシンNo. + 精算回数 + 日付 + 時刻 の組み合わせで一意に特定する。

- 精算回数はレジの連番だが、リセットされる可能性があるため単独では使用しない
- 将来的に複数レジ（マシンNo.）に対応する

### テーブル構成（7テーブル追加）

DBテーブル名には `reg_` プレフィックスをつける。

テーブル見出しの記法: `Prismaモデル名` → `DBテーブル名`
- Prismaモデル名（PascalCase）: コード上で `prisma.registerSettlement.findMany()` のように使う
- DBテーブル名（snake_case）: PostgreSQLの実際のテーブル名。`@@map()` で指定する

#### 1. 精算ヘッダー: `RegisterSettlement` → `reg_settlements`

5種別CSVの共通メタデータを集約する親テーブル。

| カラム | 型 | 説明 |
|--------|------|------|
| id | Int (PK) | 自動採番 |
| machine_no | String | マシンNo.（例: "0000"） |
| settlement_count | Int | 精算回数 |
| date | DateTime @db.Date | 精算日付 |
| time | String | 精算時刻（例: "20:05"） |
| created_at | DateTime | 作成日時 |

- ユニーク制約: `[machineNo, settlementCount, date, time]`

#### 2. 取り込みファイル管理: `RegisterImportFile` → `reg_import_files`

差分判定に使用。ファイル名で照合する。

| カラム | 型 | 説明 |
|--------|------|------|
| id | Int (PK) | 自動採番 |
| file_name | String (unique) | CSVファイル名 |
| file_type | String | 種別コード（例: "Z001"） |
| settlement_id | Int (FK) | 精算ヘッダーID |
| imported_at | DateTime | 取り込み日時 |

#### 3. 売上明細: `RegisterSalesSummary` → `reg_sales_summaries`（Z001）

28行固定、全行登録。

| カラム | 型 | 説明 |
|--------|------|------|
| id | Int (PK) | 自動採番 |
| settlement_id | Int (FK) | 精算ヘッダーID |
| record_no | Int | レコード番号 |
| item_name | String | 項目名（例: "総売", "純売"） |
| quantity | Int | 個数/件数 |
| amount | Int | 金額 |

- ユニーク制約: `[settlementId, recordNo]`

#### 4. 取引キー: `RegisterTransactionKey` → `reg_transaction_keys`（Z002）

空白行は除外。

| カラム | 型 | 説明 |
|--------|------|------|
| id | Int (PK) | 自動採番 |
| settlement_id | Int (FK) | 精算ヘッダーID |
| record_no | Int | レコード番号 |
| item_name | String | 取引方法名（例: "現金"） |
| quantity | Int | 件数 |
| amount | Int | 金額 |

- ユニーク制約: `[settlementId, recordNo]`

#### 5. 商品売上: `RegisterProductSale` → `reg_product_sales`（Z004）

個数・金額ともに0の行は除外。

| カラム | 型 | 説明 |
|--------|------|------|
| id | Int (PK) | 自動採番 |
| settlement_id | Int (FK) | 精算ヘッダーID |
| record_no | Int | レコード番号 |
| item_code | String | 商品コード |
| item_name | String | 商品名 |
| quantity | Int | 個数 |
| amount | Int | 金額 |

- ユニーク制約: `[settlementId, recordNo]`

#### 6. 部門売上: `RegisterDepartmentSale` → `reg_department_sales`（Z005）

個数・金額ともに0の行は除外。

| カラム | 型 | 説明 |
|--------|------|------|
| id | Int (PK) | 自動採番 |
| settlement_id | Int (FK) | 精算ヘッダーID |
| record_no | Int | レコード番号 |
| item_name | String | 部門名 |
| quantity | Int | 個数 |
| amount | Int | 金額 |

- ユニーク制約: `[settlementId, recordNo]`

#### 7. 時間帯別売上: `RegisterHourlySale` → `reg_hourly_sales`（Z009）

件数・金額ともに0の行は除外。

| カラム | 型 | 説明 |
|--------|------|------|
| id | Int (PK) | 自動採番 |
| settlement_id | Int (FK) | 精算ヘッダーID |
| record_no | Int | レコード番号 |
| start_time | String | 開始時刻（例: "11:00"） |
| end_time | String | 終了時刻（例: "12:00"） |
| quantity | Int | 件数 |
| amount | Int | 金額 |

- ユニーク制約: `[settlementId, recordNo]`

### 設計判断

- **親テーブル集約**: 5種別のCSVが同じメタデータを共有するため、精算ヘッダーに集約しリレーションで紐づけ
- **汎用的なカラム名**: CASIO固有名称（キャラクター、PLUコード）ではなく `itemName`, `itemCode` を使用
- **金額はInt**: 日本円に小数点なし
- **時刻はString**: CSVの生値を保持しユニークキーの一部として使用
- **onDelete: Cascade**: 精算ヘッダー削除で関連データを一括削除可能（再取り込み対応）
- **reg_ プレフィックス**: 既存テーブル（users, products等）と区別するため

---

## アップロード方法

差分判定方式を採用する。

1. オーナーがWeb画面からXZ_BKUPフォルダを選択
2. ブラウザがファイル名一覧をサーバーに送信
3. サーバーがDBと照合し、未取り込みファイル名を返す
4. 未取り込みファイルだけアップロードする

初回は全ファイル取り込み。2回目以降は差分のみで高速。
