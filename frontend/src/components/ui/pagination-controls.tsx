import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination'
import { PaginationControls, getPaginationRange } from '@/hooks/usePagination'
import { ChevronFirst, ChevronLast } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationControlsProps {
  pagination: PaginationControls
  showPageSizeSelector?: boolean
  pageSizeOptions?: number[]
  className?: string
}

export function PaginationControlsComponent({
  pagination,
  showPageSizeSelector = true,
  pageSizeOptions = [5, 10, 30],
  className,
}: PaginationControlsProps) {
  const {
    page,
    pageSize,
    totalPages,
    total,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
    setPageSize,
  } = pagination

  const paginationRange = getPaginationRange(page, totalPages)
  
  const startItem = Math.min((page - 1) * pageSize + 1, total)
  const endItem = Math.min(page * pageSize, total)

  if (totalPages <= 1 && !showPageSizeSelector) {
    return null
  }

  return (
    <div className={`flex justify-between items-center ${className}`}>
      {/* Results info */}
      <div className='flex flex-col items-center space-y-2'>
        <span className="text-sm text-muted-foreground">
          Showing {startItem} to {endItem} of {total} results
        </span>
        {showPageSizeSelector && (
          <div className="flex items-center space-x-2">
            <p className="text-sm text-muted-foreground">Show</p>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => setPageSize(Number(value))}
            >
              <SelectTrigger className="w-20">
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
            <p className="text-sm text-muted-foreground">per page</p>
          </div>
        )}
      </div>

      <div>
        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center space-x-2">
            <Pagination>
              <PaginationContent>
                {/* First page button */}
                <PaginationItem>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={goToFirstPage}
                    disabled={!hasPreviousPage}
                    aria-label="Go to first page"
                  >
                    <ChevronFirst className="h-4 w-4" />
                  </Button>
                </PaginationItem>

                {/* Previous page button */}
                <PaginationItem>
                  <PaginationPrevious
                    onClick={goToPreviousPage}
                    className={cn(!hasPreviousPage ? 'pointer-events-none opacity-50' : 'cursor-pointer')}
                  />
                </PaginationItem>

                {/* Page numbers */}
                {paginationRange.map((pageNumber, index) => (
                  <PaginationItem key={index}>
                    {pageNumber === '...' ? (
                      <PaginationEllipsis>
                        <span className="sr-only">More pages</span>
                      </PaginationEllipsis>
                    ) : (
                      <PaginationLink
                        onClick={() => goToPage(Number(pageNumber))}
                        isActive={Number(pageNumber) === page}
                        className={cn('cursor-pointer', Number(pageNumber) === page ? 'pointer-events-none' : '')}
                      >
                        {pageNumber}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                {/* Next page button */}
                <PaginationItem>
                  <PaginationNext
                    onClick={goToNextPage}
                    className={cn(!hasNextPage ? 'pointer-events-none opacity-50' : 'cursor-pointer')}
                  />
                </PaginationItem>

                {/* Last page button */}
                <PaginationItem>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={goToLastPage}
                    disabled={!hasNextPage}
                    aria-label="Go to last page"
                  >
                    <ChevronLast className="h-4 w-4" />
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

    </div>
  )
}
