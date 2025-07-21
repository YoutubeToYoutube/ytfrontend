import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  maxVisiblePages?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  maxVisiblePages = 5,
}: PaginationProps) {
  // Don't render pagination if there's only one page or no pages
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const pages: (number | 'ellipsis')[] = [];
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Complex logic for showing pages with ellipsis
      const halfVisible = Math.floor(maxVisiblePages / 2);
      
      if (currentPage <= halfVisible + 1) {
        // Show first pages
        for (let i = 1; i <= maxVisiblePages - 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - halfVisible) {
        // Show last pages
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - maxVisiblePages + 2; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show middle pages
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - halfVisible + 1; i <= currentPage + halfVisible - 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex items-center justify-center space-x-1">
      {/* First page button */}
      {showFirstLast && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="hidden sm:flex"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
      )}

      {/* Previous page button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Page numbers */}
      <div className="flex items-center space-x-1">
        {visiblePages.map((page, index) => {
          if (page === 'ellipsis') {
            return (
              <div key={`ellipsis-${index}`} className="px-2">
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </div>
            );
          }

          return (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page)}
              className="min-w-[32px]"
            >
              {page}
            </Button>
          );
        })}
      </div>

      {/* Next page button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Last page button */}
      {showFirstLast && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="hidden sm:flex"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      )}

      {/* Page info */}
      <div className="hidden md:flex items-center text-sm text-muted-foreground ml-4">
        Page {currentPage} sur {totalPages}
      </div>
    </div>
  );
}

interface PaginationInfoProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  itemName?: string;
}

export function PaginationInfo({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  itemName = "éléments",
}: PaginationInfoProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalItems === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        Aucun {itemName} trouvé
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <div>
        Affichage de {startItem} à {endItem} sur {totalItems} {itemName}
      </div>
      <div className="md:hidden">
        Page {currentPage} sur {totalPages}
      </div>
    </div>
  );
}

interface PageSizeSelectorProps {
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  itemName?: string;
}

export function PageSizeSelector({
  pageSize,
  onPageSizeChange,
  pageSizeOptions = [6, 12, 24, 48],
  itemName = "éléments",
}: PageSizeSelectorProps) {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-muted-foreground">Afficher</span>
      <Select value={pageSize.toString()} onValueChange={(value) => onPageSizeChange(parseInt(value))}>
        <SelectTrigger className="w-[70px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {pageSizeOptions.map((size) => (
            <SelectItem key={size} value={size.toString()}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-sm text-muted-foreground">{itemName} par page</span>
    </div>
  );
}