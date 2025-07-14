/**
 * tableOptimizer.ts
 * Bu modül, büyük veri setleriyle çalışırken tablo performansını optimize etmek için yardımcı işlevler sağlar.
 * 100,000+ kayıt içeren tablolarda bile etkili performans için tasarlanmıştır.
 */

import { useMemo } from 'react';

/**
 * Büyük veri setleri için performans optimizasyonlu filtreleme
 * 
 * @param data Filtrelenecek veri dizisi
 * @param filters Uygulanacak filtreler nesnesi (anahtar: değer)
 * @param searchTerm Metin araması için kullanılacak terim
 * @param searchFields Metin aramasının uygulanacağı alanlar
 * @returns Filtrelenmiş veri dizisi
 */
export function useFilteredData<T extends Record<string, any>>(
  data: T[],
  filters: Record<string, any>,
  searchTerm: string = '',
  searchFields: string[] = []
): T[] {
  return useMemo(() => {
    // Erken çıkış: Filtre yoksa ve arama terimi yoksa, tüm veriyi döndür
    if (Object.keys(filters).length === 0 && !searchTerm) {
      return data;
    }

    // Önbellekleme işlemleri için değişkenleri önceden hesapla
    const lowerSearchTerm = searchTerm.toLowerCase();
    const activeFilters = Object.entries(filters).filter(([_, value]) => value !== '' && value !== 'all');
    
    // Eğer aktif filtre yoksa ve arama terimi yoksa, tüm veriyi döndür
    if (activeFilters.length === 0 && !lowerSearchTerm) {
      return data;
    }

    // Verimliliği artırmak için kademeli filtreleme uygula
    return data.filter(item => {
      // 1. Önce arama terimini kontrol et (en yaygın kullanılan filtre)
      if (lowerSearchTerm) {
        const matchesSearch = searchFields.some(field => {
          const value = item[field];
          return value && String(value).toLowerCase().includes(lowerSearchTerm);
        });
        
        if (!matchesSearch) return false;
      }
      
      // 2. Sonra diğer filtreleri kontrol et
      for (const [key, filterValue] of activeFilters) {
        const itemValue = item[key];
        
        // filterValue bir dizi ise, değerin bu dizide olup olmadığını kontrol et
        if (Array.isArray(filterValue)) {
          if (!filterValue.includes(itemValue)) return false;
        } 
        // Boolean değerler için özel karşılaştırma
        else if (typeof itemValue === 'boolean') {
          if (itemValue !== (filterValue === 'true' || filterValue === true)) return false;
        }
        // Diğer değerler için eşitlik kontrolü
        else if (itemValue !== filterValue) {
          return false;
        }
      }
      
      return true;
    });
  }, [data, filters, searchTerm, searchFields]);
}

/**
 * Büyük veri setleri için performans optimizasyonlu sıralama
 * 
 * @param data Sıralanacak veri dizisi
 * @param sortField Sıralama yapılacak alan
 * @param sortDirection 'asc' veya 'desc' sıralama yönü
 * @returns Sıralanmış veri dizisi
 */
export function useSortedData<T extends Record<string, any>>(
  data: T[],
  sortField: string,
  sortDirection: 'asc' | 'desc' = 'asc'
): T[] {
  return useMemo(() => {
    // Erken çıkış: sıralama alanı yoksa, veriyi değiştirmeden döndür
    if (!sortField) return data;
    
    // Performans için mevcut diziyi değiştirmeden kopyalama
    const sortedData = [...data];
    
    // Performans için karşılaştırma fonksiyonunu önceden tanımla
    const compareFunction = (a: T, b: T) => {
      // null ve undefined değerleri her zaman en sona yerleştir
      if (a[sortField] === null || a[sortField] === undefined) return 1;
      if (b[sortField] === null || b[sortField] === undefined) return -1;
      
      // Rakamlar için sayısal karşılaştırma
      if (typeof a[sortField] === 'number' && typeof b[sortField] === 'number') {
        return sortDirection === 'asc' 
          ? a[sortField] - b[sortField]
          : b[sortField] - a[sortField];
      }
      
      // Tarihler için özel karşılaştırma
      if (a[sortField] instanceof Date && b[sortField] instanceof Date) {
        return sortDirection === 'asc'
          ? a[sortField].getTime() - b[sortField].getTime()
          : b[sortField].getTime() - a[sortField].getTime();
      }
      
      // String'ler için alfabetik karşılaştırma
      const aStr = String(a[sortField]).toLowerCase();
      const bStr = String(b[sortField]).toLowerCase();
      
      if (sortDirection === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    };
    
    // Sıralama işlemini uygula
    return sortedData.sort(compareFunction);
  }, [data, sortField, sortDirection]);
}

/**
 * Performans optimizasyonlu sayfalama
 * 
 * @param data Sayfalanacak veri dizisi
 * @param currentPage Geçerli sayfa numarası (1'den başlar)
 * @param itemsPerPage Sayfa başına öğe sayısı
 * @returns Sayfalanmış veri dizisi
 */
export function usePaginatedData<T>(
  data: T[],
  currentPage: number,
  itemsPerPage: number
): T[] {
  return useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, data.length);
    
    // Sınırları doğrula
    if (startIndex >= data.length) {
      return [];
    }
    
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, itemsPerPage]);
}

/**
 * Yüksek performanslı veri işleme (filtreleme, sıralama ve sayfalama birleştirilmiş)
 */
export function useProcessedTableData<T extends Record<string, any>>(
  data: T[],
  filters: Record<string, any>,
  searchTerm: string,
  searchFields: string[],
  sortField: string,
  sortDirection: 'asc' | 'desc',
  currentPage: number,
  itemsPerPage: number
): {
  processedData: T[],
  totalItems: number,
  totalPages: number
} {
  // Filtrelenmiş veriyi al
  const filteredData = useFilteredData(data, filters, searchTerm, searchFields);
  
  // Sıralanmış veriyi al
  const sortedData = useSortedData(filteredData, sortField, sortDirection);
  
  // Sayfalanmış veriyi al
  const paginatedData = usePaginatedData(sortedData, currentPage, itemsPerPage);
  
  // Toplam sayfa sayısını hesapla
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  
  return {
    processedData: paginatedData,
    totalItems: filteredData.length,
    totalPages
  };
}