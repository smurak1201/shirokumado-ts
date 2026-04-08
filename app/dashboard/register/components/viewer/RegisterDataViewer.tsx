"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/app/components/ui/tabs";
import { ANALYSIS_TABS, type AnalysisTabValue } from "../../types";
import { useRegisterData } from "./hooks/useRegisterData";
import { usePeriodPresets } from "./hooks/usePeriodPresets";
import PeriodSelector from "./PeriodSelector";
import MachineFilter from "./MachineFilter";
import PeriodPresets from "./PeriodPresets";
import SavePeriodPresetButton from "./SavePeriodPresetButton";
import SettingsDialog from "./SettingsDialog";
import SalesTargetSettings from "./SalesTargetSettings";
import { useDashboardSettings } from "./hooks/useDashboardSettings";
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
    granularity,
    machines,
    data,
    totalCustomers,
    previousCustomers,
    topProducts,
    dailyTimeSeries,
    dailyCustomerTimeSeries,
    isLoading,
    setPeriodType,
    setDateFrom,
    setDateTo,
    setMachineNo,
    navigatePeriod,
    refetchMachines,
    setCompareRange,
  } = useRegisterData("Z005");

  const { presets, isLoading: isPresetsLoading, createPreset, deletePreset } = usePeriodPresets();
  const { defaults, isLoading: isSettingsLoading } = useDashboardSettings();
  const [activeTab, setActiveTab] = useState<AnalysisTabValue>("overview");
  const [hasAppliedDefaults, setHasAppliedDefaults] = useState(false);
  const [selectedComparePresetId, setSelectedComparePresetId] = useState<number | null>(null);

  /** 比較プリセット選択時にcompareRangeを更新 */
  const handleComparePresetChange = (presetId: number | null) => {
    setSelectedComparePresetId(presetId);
    if (presetId === null) {
      setCompareRange(null);
      return;
    }
    const preset = presets.find((p) => p.id === presetId);
    if (preset) {
      setCompareRange({
        from: preset.dateFrom.slice(0, 10),
        to: preset.dateTo.slice(0, 10),
      });
    }
  };

  // 設定ロード完了後に初回のみデフォルト値を反映（レンダリング中の条件付き更新）
  if (!isSettingsLoading && !hasAppliedDefaults) {
    setPeriodType(defaults.defaultPeriodType);
    setActiveTab(defaults.defaultTab);
    setHasAppliedDefaults(true);
  }

  // 比較ラベル: カスタム比較時はプリセット名、それ以外は「前年比」
  const compareLabel = selectedComparePresetId
    ? `${presets.find((p) => p.id === selectedComparePresetId)?.name ?? ""}比`
    : "前年比";

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
          saveAction={
            <SavePeriodPresetButton
              currentDateFrom={dateFrom}
              currentDateTo={dateTo}
              onSave={createPreset}
            />
          }
          comparePresets={presets}
          selectedComparePresetId={selectedComparePresetId}
          onComparePresetChange={handleComparePresetChange}
        />
        {/* 2列目: 設定・プリセット・レジ選択 */}
        <div className="flex w-full flex-wrap items-center gap-2">
          <SettingsDialog machines={machines} onMachineNamesChange={refetchMachines} />
          <SalesTargetSettings />
          <PeriodPresets
            presets={presets}
            isLoading={isPresetsLoading}
            onApply={(from, to) => {
              setPeriodType("custom");
              setDateFrom(from);
              setDateTo(to);
            }}
            onDelete={deletePreset}
          />
          <div className="ml-auto">
            <MachineFilter
              machines={machines}
              machineNo={machineNo}
              onMachineNoChange={setMachineNo}
            />
          </div>
        </div>
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
                  dailyCustomerTimeSeries={dailyCustomerTimeSeries}
                  granularity={granularity}
                  dateFrom={dateFrom}
                  compareLabel={compareLabel}
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
                  compareLabel={compareLabel}
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
