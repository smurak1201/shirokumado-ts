"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/app/components/ui/tabs";
import { ANALYSIS_TABS } from "../../types";
import { useRegisterData } from "./hooks/useRegisterData";
import PeriodSelector from "./PeriodSelector";
import MachineFilter from "./MachineFilter";
import SalesOverviewTab from "./tabs/SalesOverviewTab";

export default function RegisterDataViewer() {
  const {
    periodType,
    dateFrom,
    dateTo,
    machineNo,
    groupBy,
    machines,
    data,
    totalCustomers,
    previousCustomers,
    topProducts,
    isLoading,
    setPeriodType,
    setDateFrom,
    setDateTo,
    setMachineNo,
    setGroupBy,
    navigatePeriod,
  } = useRegisterData("Z001");

  return (
    <div className="space-y-4">
      {/* フィルタバー */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="space-y-3">
          <PeriodSelector
            periodType={periodType}
            dateFrom={dateFrom}
            dateTo={dateTo}
            onPeriodTypeChange={setPeriodType}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
            onNavigate={navigatePeriod}
          />
          <MachineFilter
            machines={machines}
            machineNo={machineNo}
            groupBy={groupBy}
            onMachineNoChange={setMachineNo}
            onGroupByChange={setGroupBy}
          />
        </div>
      </div>

      {/* ローディング */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-gray-400">読み込み中...</div>
        </div>
      )}

      {/* 第2層タブ */}
      {!isLoading && (
        <Tabs defaultValue="overview">
          <TabsList className="w-full overflow-x-auto">
            {ANALYSIS_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="shrink-0">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview">
            {data ? (
              <SalesOverviewTab
                data={data}
                totalCustomers={totalCustomers}
                previousCustomers={previousCustomers}
                topProducts={topProducts}
              />
            ) : (
              <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-400">
                データがありません
              </div>
            )}
          </TabsContent>

          {/* 他のタブは後続の仕様書で実装 */}
          <TabsContent value="trend">
            <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500">
              売上推移（準備中）
            </div>
          </TabsContent>
          <TabsContent value="hourly">
            <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500">
              時間帯分析（準備中）
            </div>
          </TabsContent>
          <TabsContent value="product">
            <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500">
              商品分析（準備中）
            </div>
          </TabsContent>
          <TabsContent value="department">
            <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500">
              部門分析（準備中）
            </div>
          </TabsContent>
          <TabsContent value="transaction">
            <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500">
              取引管理（準備中）
            </div>
          </TabsContent>
          <TabsContent value="raw">
            <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500">
              明細データ（準備中）
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
