"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/app/components/ui/tabs";
import { ANALYSIS_TABS, type AnalysisTabValue } from "../../types";
import { useRegisterData } from "./hooks/useRegisterData";
import PeriodSelector from "./PeriodSelector";
import MachineFilter from "./MachineFilter";
import SalesOverviewTab from "./tabs/SalesOverviewTab";
import SalesTrendTab from "./tabs/SalesTrendTab";
import HourlyAnalysisTab from "./tabs/HourlyAnalysisTab";
import ProductAnalysisTab from "./tabs/ProductAnalysisTab";
import TransactionTab from "./tabs/TransactionTab";
import RawDataTab from "./tabs/RawDataTab";

/** 横スクロール可能なTabsListに左右フェードを付与 */
function ScrollableTabsList({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      ro.disconnect();
    };
  }, [updateScrollState]);

  return (
    <div className="relative">
      {canScrollLeft && (
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-6 bg-linear-to-r from-white to-transparent" />
      )}
      <TabsList ref={ref} className="w-full justify-start overflow-x-auto sm:justify-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </TabsList>
      {canScrollRight && (
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-6 bg-linear-to-l from-white to-transparent" />
      )}
    </div>
  );
}

export default function RegisterDataViewer() {
  const {
    periodType,
    dateFrom,
    dateTo,
    machineNo,
    groupBy,
    granularity,
    machines,
    data,
    totalCustomers,
    previousCustomers,
    topProducts,
    dailyTimeSeries,
    isLoading,
    setPeriodType,
    setDateFrom,
    setDateTo,
    setMachineNo,
    setGroupBy,
    navigatePeriod,
  } = useRegisterData("Z005");

  const [activeTab, setActiveTab] = useState<AnalysisTabValue>("overview");

  /** ローディング中はプレースホルダーを表示するラッパー */
  function withLoading(content: ReactNode): ReactNode {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12" role="status" aria-live="polite">
          <div className="text-sm text-solid-gray-536">読み込み中...</div>
        </div>
      );
    }
    return content;
  }

  return (
    <div className="space-y-4">
      {/* フィルタバー */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-3 rounded-8 border border-solid-gray-200 bg-white p-4" aria-label="データフィルター">
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

      {/* 第2層タブ */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AnalysisTabValue)}>
          <ScrollableTabsList>
            {ANALYSIS_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="shrink-0">
                {tab.label}
              </TabsTrigger>
            ))}
          </ScrollableTabsList>

          <TabsContent value="overview">
            {withLoading(
              data ? (
                <SalesOverviewTab
                  data={data}
                  totalCustomers={totalCustomers}
                  previousCustomers={previousCustomers}
                  topProducts={topProducts}
                  dailyTimeSeries={dailyTimeSeries}
                  granularity={granularity}
                />
              ) : (
                <div className="rounded-8 border border-solid-gray-200 bg-white p-6 text-center text-sm text-solid-gray-536">
                  データがありません
                </div>
              )
            )}
          </TabsContent>

          <TabsContent value="trend">
            {withLoading(
              data ? (
                <SalesTrendTab
                  data={data}
                  totalCustomers={totalCustomers}
                  previousCustomers={previousCustomers}
                  dateFrom={dateFrom}
                  dateTo={dateTo}
                  granularity={granularity}
                />
              ) : (
                <div className="rounded-8 border border-solid-gray-200 bg-white p-6 text-center text-sm text-solid-gray-536">
                  データがありません
                </div>
              )
            )}
          </TabsContent>

          <TabsContent value="hourly">
            <HourlyAnalysisTab
              dateFrom={dateFrom}
              dateTo={dateTo}
              machineNo={machineNo}
            />
          </TabsContent>
          <TabsContent value="product">
            <ProductAnalysisTab
              dateFrom={dateFrom}
              dateTo={dateTo}
              machineNo={machineNo}
            />
          </TabsContent>
          <TabsContent value="transaction">
            <TransactionTab
              dateFrom={dateFrom}
              dateTo={dateTo}
              machineNo={machineNo}
              granularity={granularity}
            />
          </TabsContent>
          <TabsContent value="raw">
            <RawDataTab
              dateFrom={dateFrom}
              dateTo={dateTo}
              machineNo={machineNo}
            />
          </TabsContent>
        </Tabs>
    </div>
  );
}
