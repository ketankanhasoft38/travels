'use client';

import { useEffect, useState } from 'react';
import {
  Alert,
  Chip,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import PendingOutlinedIcon from '@mui/icons-material/PendingOutlined';
import { AppShell } from '@/components/layout/app-shell';
import { apiClient } from '@/lib/api-client';
import { Booking } from '@/lib/types';

type BookingStatusFilter = 'all' | 'pending' | 'confirmed' | 'cancelled';

const statusChip = (status: Booking['status']) => {
  if (status === 'confirmed') {
    return <Chip size="small" icon={<CheckCircleOutlineIcon />} label="CONFIRMED" color="success" />;
  }
  if (status === 'cancelled') {
    return <Chip size="small" icon={<CancelOutlinedIcon />} label="CANCELLED" color="error" />;
  }
  return <Chip size="small" icon={<PendingOutlinedIcon />} label="PENDING" color="warning" />;
};

export default function BookingsDashboardPage() {
  const [rows, setRows] = useState<Booking[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatusFilter>('all');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [rowCount, setRowCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadBookings = async () => {
      setErrorMessage('');
      setIsLoading(true);
      try {
        const result = await apiClient.listCreatorBookings(
          paginationModel.page + 1,
          paginationModel.pageSize,
          searchText,
          statusFilter,
        );
        setRows(result.data);
        setRowCount(result.pagination.total);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Failed to load bookings');
      } finally {
        setIsLoading(false);
      }
    };

    void loadBookings();
  }, [paginationModel, searchText, statusFilter]);

  const columns: GridColDef<Booking>[] = [
    { field: 'visitor_name', headerName: 'Visitor', flex: 1.1, minWidth: 170 },
    { field: 'visitor_email', headerName: 'Email', flex: 1.2, minWidth: 220 },
    {
      field: 'tours',
      headerName: 'Tour',
      flex: 1.1,
      minWidth: 180,
      valueGetter: (_value, row) => row.tours?.title ?? 'Unknown Tour',
    },
    { field: 'guest_count', headerName: 'Guests', width: 90 },
    {
      field: 'total_price_cents',
      headerName: 'Amount',
      minWidth: 130,
      valueFormatter: (value) => `${(Number(value) / 100).toFixed(2)} USD`,
    },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 150,
      renderCell: (params) => statusChip(params.row.status),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      filterable: false,
      minWidth: 220,
      renderCell: (params) => (
        <Stack direction="row" spacing={1} sx={{mt:2}}>
          <Chip
            size="small"
            label="Confirm"
            color="success"
            onClick={async () => {
              try {
                const updated = await apiClient.updateBookingStatus(params.row.id, 'confirmed');
                setRows((prev) => prev.map((item) => (item.id === params.row.id ? { ...item, ...updated } : item)));
              } catch (error) {
                setErrorMessage(error instanceof Error ? error.message : 'Failed to update booking');
              }
            }}
          />
          <Chip
            size="small"
            label="Cancel"
            color="error"
            onClick={async () => {
              try {
                const updated = await apiClient.updateBookingStatus(params.row.id, 'cancelled');
                setRows((prev) => prev.map((item) => (item.id === params.row.id ? { ...item, ...updated } : item)));
              } catch (error) {
                setErrorMessage(error instanceof Error ? error.message : 'Failed to update booking');
              }
            }}
          />
        </Stack>
      ),
    },
  ];

  return (
    <AppShell title="Booking Management">
      <Stack spacing={2.5}>
        {errorMessage.length > 0 && <Alert severity="error">{errorMessage}</Alert>}

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
          <TextField
            label="Search visitor, email, or tour"
            value={searchText}
            onChange={(event) => {
              setSearchText(event.target.value);
              setPaginationModel((prev) => ({ ...prev, page: 0 }));
            }}
            sx={{ minWidth: { xs: '100%', md: 360 } }}
          />
          <TextField
            select
            label="Status filter"
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value as BookingStatusFilter);
              setPaginationModel((prev) => ({ ...prev, page: 0 }));
            }}
            sx={{ width: { xs: '100%', md: 220 } }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="confirmed">Confirmed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </TextField>
        </Stack>

        <DataGrid
          rows={rows}
          columns={columns}
          loading={isLoading}
          getRowId={(row) => row.id}
          rowCount={rowCount}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 20, 50]}
          disableRowSelectionOnClick
          autoHeight
          sx={{
            bgcolor: 'white',
            borderRadius: 2,
            borderColor: '#e6ebf5',
            '& .MuiDataGrid-columnHeaders': { bgcolor: '#f8fafe' },
          }}
        />

        <Typography variant="body2" color="text.secondary">
          Showing server-side paginated data with live search and status filtering.
        </Typography>
      </Stack>
    </AppShell>
  );
}
