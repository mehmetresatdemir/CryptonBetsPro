import React, { useMemo, useState, useCallback } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { useProcessedTableData } from '@/lib/tableOptimizer';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export interface DataColumn<T> {
  key: keyof T;
  header: string;
  width?: string;
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
}

export interface OptimizedDataTableProps<T extends Record<string, any>> {
  data: T[];
  columns: DataColumn<T>[];
  filters: Record<string, any>;
  searchTerm: string;
  searchFields: string[];
  sortField: string;
  sortDirection: 'asc' | 'desc';
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onSortChange: (field: string) => void;
  selectedRows?: number[];
  onRowSelect?: (id: number) => void;
  onSelectAll?: () => void;
  getRowId: (item: T) => number;
  rowHeight?: number;
  isLoading?: boolean;
  renderRowActions?: (item: T) => React.ReactNode;
  emptyMessage?: string;
  className?: string;
  translations?: {
    showing?: string;
    to?: string;
    of?: string;
    items?: string;
    previous?: string;
    next?: string;
    first?: string;
    last?: string;
    noData?: string;
    loading?: string;
  };
}

/**
 * Büyük veri setleri (100,000+ kayıt) için optimize edilmiş veri tablosu bileşeni
 * Performans için sanal liste kullanır ve filtreleme, sıralama, sayfalama işlevlerini optimize eder
 */
export function OptimizedDataTable<T extends Record<string, any>>({
  data,
  columns,
  filters,
  searchTerm = '',
  searchFields = [],
  sortField,
  sortDirection = 'desc',
  currentPage = 1,
  itemsPerPage = 10,
  onPageChange,
  onSortChange,
  selectedRows = [],
  onRowSelect,
  onSelectAll,
  getRowId,
  rowHeight = 60,
  isLoading = false,
  renderRowActions,
  emptyMessage = 'Veri bulunamadı',
  className = '',
  translations = {}
}: OptimizedDataTableProps<T>) {
  const { t: translate } = useLanguage();
  
  // Varsayılan çeviriler
  const t = {
    showing: 'Gösteriliyor',
    to: '-',
    of: '/',
    items: 'öğe',
    previous: 'Önceki',
    next: 'Sonraki',
    first: 'İlk',
    last: 'Son',
    noData: 'Veri bulunamadı',
    loading: 'Yükleniyor...',
    ...translations
  };

  // Verileri işle (filtrele, sırala, sayfala)
  const { processedData, totalItems, totalPages } = useProcessedTableData(
    data,
    filters,
    searchTerm,
    searchFields,
    sortField,
    sortDirection,
    currentPage,
    itemsPerPage
  );

  // Tüm gösterilen öğelerin seçili olup olmadığını kontrol et
  const allItemsSelected = useMemo(() => {
    return processedData.length > 0 && 
      processedData.every(item => selectedRows.includes(getRowId(item)));
  }, [processedData, selectedRows, getRowId]);

  // Sıralama işleyicisi
  const handleSort = useCallback((column: DataColumn<T>) => {
    if (!column.sortable) return;
    onSortChange(column.key as string);
  }, [onSortChange]);

  // Tablo satırını render et
  const renderRow = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = processedData[index];
    const rowId = getRowId(item);
    const isSelected = selectedRows.includes(rowId);

    return (
      <div 
        style={style} 
        className={`flex items-center w-full ${
          index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-850'
        } ${isSelected ? 'bg-gray-700' : 'hover:bg-gray-700'} transition-colors`}
      >
        {onRowSelect && (
          <div className="px-4 flex-shrink-0 w-12">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onRowSelect(rowId)}
              className="rounded border-gray-400 text-yellow-500 focus:ring-yellow-500"
            />
          </div>
        )}
        
        {columns.map((column) => (
          <div 
            key={column.key as string} 
            className={`px-4 py-3 truncate ${column.width || 'flex-1'}`}
          >
            {column.render 
              ? column.render(item[column.key], item)
              : String(item[column.key] || '')}
          </div>
        ))}
        
        {renderRowActions && (
          <div className="px-4 flex-shrink-0 w-24 flex justify-end">
            {renderRowActions(item)}
          </div>
        )}
      </div>
    );
  }, [processedData, columns, selectedRows, getRowId, onRowSelect, renderRowActions]);

  // Tablo başlığını render et
  const renderHeader = useCallback(() => (
    <div className="flex items-center w-full bg-gray-900 border-b border-gray-700 sticky top-0 z-10">
      {onRowSelect && (
        <div className="px-4 flex-shrink-0 w-12">
          <input
            type="checkbox"
            checked={allItemsSelected}
            onChange={onSelectAll}
            className="rounded border-gray-400 text-yellow-500 focus:ring-yellow-500"
          />
        </div>
      )}
      
      {columns.map((column) => (
        <div 
          key={column.key as string} 
          className={`px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider ${column.width || 'flex-1'} ${
            column.sortable ? 'cursor-pointer hover:text-white' : ''
          }`}
          onClick={column.sortable ? () => handleSort(column) : undefined}
        >
          <div className="flex items-center">
            {column.header}
            
            {column.sortable && sortField === column.key && (
              <span className="ml-1">
                {sortDirection === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </div>
        </div>
      ))}
      
      {renderRowActions && (
        <div className="px-4 flex-shrink-0 w-24">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            İşlemler
          </span>
        </div>
      )}
    </div>
  ), [columns, sortField, sortDirection, handleSort, allItemsSelected, onSelectAll, onRowSelect, renderRowActions]);

  // Yükleme durumunu göster
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-850 rounded-md">
        <div className="animate-spin w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full mb-4"></div>
        <p className="text-gray-400">{t.loading}</p>
      </div>
    );
  }

  // Veri yoksa mesaj göster
  if (!isLoading && processedData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-850 rounded-md">
        <p className="text-gray-400">{emptyMessage || t.noData}</p>
      </div>
    );
  }

  return (
    <div className={`w-full flex flex-col ${className}`}>
      {/* Tablo */}
      <div className="bg-gray-850 rounded-md overflow-hidden mb-4 flex-grow">
        <div style={{ height: Math.min(rowHeight * processedData.length + 40, 500) }}>
          {renderHeader()}
          
          <AutoSizer disableHeight>
            {({ width }) => (
              <FixedSizeList
                height={Math.min(rowHeight * processedData.length, 460)}
                width={width}
                itemCount={processedData.length}
                itemSize={rowHeight}
                overscanCount={5}
                className="scrollbar-thin scrollbar-thumb-gray-600"
              >
                {renderRow}
              </FixedSizeList>
            )}
          </AutoSizer>
        </div>
      </div>
      
      {/* Sayfalama */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-850 rounded-md">
        <div className="text-sm text-gray-400">
          {t.showing} {(currentPage - 1) * itemsPerPage + 1} {t.to} {Math.min(currentPage * itemsPerPage, totalItems)} {t.of} {totalItems} {t.items}
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="p-2 rounded-md bg-gray-800 text-gray-400 hover:bg-gray-700 disabled:opacity-50 disabled:pointer-events-none"
            title={t.first}
          >
            <ChevronsLeft size={16} />
          </button>
          
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-md bg-gray-800 text-gray-400 hover:bg-gray-700 disabled:opacity-50 disabled:pointer-events-none"
            title={t.previous}
          >
            <ChevronLeft size={16} />
          </button>
          
          <span className="p-2 text-gray-400">
            {currentPage} / {totalPages}
          </span>
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-md bg-gray-800 text-gray-400 hover:bg-gray-700 disabled:opacity-50 disabled:pointer-events-none"
            title={t.next}
          >
            <ChevronRight size={16} />
          </button>
          
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-md bg-gray-800 text-gray-400 hover:bg-gray-700 disabled:opacity-50 disabled:pointer-events-none"
            title={t.last}
          >
            <ChevronsRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default OptimizedDataTable;