import React, { useMemo, useCallback, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridApi, ColumnApi, GridReadyEvent } from 'ag-grid-community';
import { Button, Space, Dropdown, MenuProps } from 'antd';
import { 
  DownloadOutlined, 
  ReloadOutlined, 
  SettingOutlined,
  FilterOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { GridColumn, GridAction, ExportOptions } from '@/types';
import { exportToCSV, exportToExcel, exportToPDF } from '@/utils/export';
import ActionCellRenderer from './ActionCellRenderer';
import StatusCellRenderer from './StatusCellRenderer';
import CurrencyCellRenderer from './CurrencyCellRenderer';
import DateCellRenderer from './DateCellRenderer';

interface DataGridProps {
  data: any[];
  columns: GridColumn[];
  actions?: GridAction[];
  loading?: boolean;
  height?: number;
  enableExport?: boolean;
  enableSearch?: boolean;
  enableFilter?: boolean;
  enableSelection?: boolean;
  onSelectionChanged?: (selectedRows: any[]) => void;
  onRowDoubleClicked?: (data: any) => void;
  onRefresh?: () => void;
  exportOptions?: Partial<ExportOptions>;
  className?: string;
}

const DataGrid: React.FC<DataGridProps> = ({
  data,
  columns,
  actions = [],
  loading = false,
  height = 500,
  enableExport = true,
  enableSearch = true,
  enableFilter = true,
  enableSelection = false,
  onSelectionChanged,
  onRowDoubleClicked,
  onRefresh,
  exportOptions = {},
  className = '',
}) => {
  const gridRef = useRef<AgGridReact>(null);
  const gridApiRef = useRef<GridApi | null>(null);
  const columnApiRef = useRef<ColumnApi | null>(null);

  // Convert custom columns to AG Grid column definitions
  const columnDefs = useMemo((): ColDef[] => {
    const cols: ColDef[] = columns.map((col) => {
      const colDef: ColDef = {
        field: col.field,
        headerName: col.headerName,
        width: col.width || 150,
        sortable: col.sortable !== false,
        filter: enableFilter && col.filter !== false,
        editable: col.editable || false,
        resizable: true,
        cellStyle: col.cellStyle,
      };

      // Set cell renderer based on type
      switch (col.type) {
        case 'currency':
          colDef.cellRenderer = CurrencyCellRenderer;
          colDef.type = 'numericColumn';
          break;
        case 'date':
          colDef.cellRenderer = DateCellRenderer;
          break;
        case 'status':
          colDef.cellRenderer = StatusCellRenderer;
          break;
        case 'number':
          colDef.type = 'numericColumn';
          break;
      }

      // Custom cell renderer
      if (col.cellRenderer) {
        colDef.cellRenderer = col.cellRenderer;
      }

      // Value formatter
      if (col.valueFormatter) {
        colDef.valueFormatter = col.valueFormatter;
      }

      return colDef;
    });

    // Add actions column if actions are provided
    if (actions.length > 0) {
      cols.push({
        field: 'actions',
        headerName: 'Actions',
        width: actions.length * 40 + 20,
        sortable: false,
        filter: false,
        resizable: false,
        pinned: 'right',
        cellRenderer: ActionCellRenderer,
        cellRendererParams: { actions },
      });
    }

    return cols;
  }, [columns, actions, enableFilter]);

  const defaultColDef = useMemo(() => ({
    flex: 1,
    minWidth: 100,
    resizable: true,
    sortable: true,
    filter: enableFilter,
  }), [enableFilter]);

  const onGridReady = useCallback((params: GridReadyEvent) => {
    gridApiRef.current = params.api;
    columnApiRef.current = params.columnApi;
  }, []);

  const onSelectionChangedHandler = useCallback(() => {
    if (onSelectionChanged && gridApiRef.current) {
      const selectedRows = gridApiRef.current.getSelectedRows();
      onSelectionChanged(selectedRows);
    }
  }, [onSelectionChanged]);

  const onRowDoubleClickedHandler = useCallback((event: any) => {
    if (onRowDoubleClicked) {
      onRowDoubleClicked(event.data);
    }
  }, [onRowDoubleClicked]);

  // Export functions
  const handleExport = useCallback((format: 'csv' | 'excel' | 'pdf') => {
    if (!gridApiRef.current) return;

    const exportData = data;
    const exportColumns = columns.filter(col => col.field !== 'actions');
    const options: ExportOptions = {
      filename: `export_${new Date().toISOString().split('T')[0]}`,
      format,
      columns: exportColumns.map(col => col.field),
      title: 'Data Export',
      ...exportOptions,
    };

    switch (format) {
      case 'csv':
        exportToCSV(exportData, exportColumns, options);
        break;
      case 'excel':
        exportToExcel(exportData, exportColumns, options);
        break;
      case 'pdf':
        exportToPDF(exportData, exportColumns, options);
        break;
    }
  }, [data, columns, exportOptions]);

  const exportMenuItems: MenuProps['items'] = [
    {
      key: 'csv',
      label: 'Export to CSV',
      onClick: () => handleExport('csv'),
    },
    {
      key: 'excel',
      label: 'Export to Excel',
      onClick: () => handleExport('excel'),
    },
    {
      key: 'pdf',
      label: 'Export to PDF',
      onClick: () => handleExport('pdf'),
    },
  ];

  const onQuickFilterChanged = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (gridApiRef.current) {
      gridApiRef.current.setQuickFilter(event.target.value);
    }
  }, []);

  const clearFilters = useCallback(() => {
    if (gridApiRef.current) {
      gridApiRef.current.setFilterModel(null);
      gridApiRef.current.setQuickFilter('');
    }
  }, []);

  const autoSizeColumns = useCallback(() => {
    if (columnApiRef.current) {
      columnApiRef.current.autoSizeAllColumns();
    }
  }, []);

  return (
    <div className={`data-grid-container ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 p-4 bg-white rounded-lg shadow-sm border">
        <div className="flex items-center gap-3 flex-wrap">
          {enableSearch && (
            <div className="relative">
              <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 max-w-full"
                onChange={onQuickFilterChanged}
              />
            </div>
          )}
          
          <Button
            icon={<FilterOutlined />}
            onClick={clearFilters}
            type="default"
          >
            <span className="hidden sm:inline">Clear Filters</span>
          </Button>
        </div>

        <Space wrap size={[8, 8]}>
          {onRefresh && (
            <Button
              icon={<ReloadOutlined />}
              onClick={onRefresh}
              loading={loading}
            >
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          )}

          <Button
            icon={<SettingOutlined />}
            onClick={autoSizeColumns}
          >
            <span className="hidden sm:inline">Auto Size</span>
          </Button>

          {enableExport && (
            <Dropdown menu={{ items: exportMenuItems }} placement="bottomRight">
              <Button icon={<DownloadOutlined />}>
                <span className="hidden sm:inline">Export</span>
              </Button>
            </Dropdown>
          )}
        </Space>
      </div>

      {/* Grid */}
      <div 
        className="ag-theme-alpine w-full border rounded-lg overflow-hidden"
        style={{ height }}
      >
        <AgGridReact
          ref={gridRef}
          rowData={loading ? undefined : data}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          onSelectionChanged={onSelectionChangedHandler}
          onRowDoubleClicked={onRowDoubleClickedHandler}
          rowSelection={enableSelection ? 'multiple' : undefined}
          enableRangeSelection={true}
          enableCharts={true}
          animateRows={true}
          pagination={true}
          paginationPageSize={50}
          paginationPageSizeSelector={[25, 50, 100, 200]}
          suppressRowClickSelection={!enableSelection}
          loadingOverlayComponent="Loading..."
          noRowsOverlayComponent="No data available"
          suppressMenuHide={true}
          enableCellTextSelection={true}
          ensureDomOrder={true}
        />
      </div>
    </div>
  );
};

export default DataGrid;
