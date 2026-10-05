import * as React from 'react';
import { SimplePagination, type PaginationData, type PaginationLink } from '@/components/ui/simple-pagination';
import {
    Table,
    TableHeader,
    TableBody,
    TableFooter,
    TableHead,
    TableRow,
    TableCell,
    TableCaption,
} from '@/components/ui/table';

export type { PaginationData, PaginationLink };

export interface DataTableProps extends React.HTMLAttributes<HTMLDivElement> {
    pagination?: PaginationData;
    showPagination?: boolean;
    perPageOptions?: number[];
    children?: React.ReactNode;
}

export function DataTable({
    children,
    pagination,
    showPagination = true,
    perPageOptions = [10, 25, 50],
    className,
    ...props
}: DataTableProps) {
    return (
        <div className={className} {...props}>
            {children}
            {showPagination && pagination && (
                <div className="mt-4">
                    <SimplePagination data={pagination} perPageOptions={perPageOptions} />
                </div>
            )}
        </div>
    );
}

export const DataTablePagination = SimplePagination;

export {
    Table,
    TableHeader,
    TableBody,
    TableFooter,
    TableHead,
    TableRow,
    TableCell,
    TableCaption,
};

export default DataTable;
