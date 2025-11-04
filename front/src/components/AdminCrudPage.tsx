import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridFilterModel,
  GridPaginationModel,
  GridSortModel,
  GridEventListener,
  gridClasses,
} from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PageContainer from './PageContainer';

const INITIAL_PAGE_SIZE = 10;

// ---------------- API 호출 관련 ----------------
export interface Member {
  member_id: number;
  id: string;
  name: string;
  phone: string;
  email: string;
  member_grade: string;
}

interface MemberListResponse {
  items: Member[];
  itemCount: number;
}

interface GetMembersParams {
  paginationModel: { page: number; pageSize: number };
  sortModel: GridSortModel;
  filterModel: GridFilterModel;
}

async function getMembers(params: GetMembersParams): Promise<MemberListResponse> {
  const { paginationModel } = params;
  const skip = paginationModel.page * paginationModel.pageSize;
  const limit = paginationModel.pageSize;

  const query = new URLSearchParams({ skip: String(skip), limit: String(limit) });

  const res = await fetch(`http://localhost:8000/admin/members?${query.toString()}`, {
    credentials: 'include', // 로그인 세션 쿠키 포함
    cache: 'no-store',       // 캐시 무시
  });

  // 상태 코드 체크
  if (!res.ok) {
    throw new Error(`Failed to fetch members: ${res.status} ${res.statusText}`);
  }

  // HTML이 섞여 들어오는 경우 대비 안전하게 파싱
  const text = await res.text();
  try {
    const data = JSON.parse(text);
    return data;
  } catch (e) {
    throw new Error('Server did not return valid JSON. Response was probably HTML.');
  }
}


// ---------------- AdminCrudPage 컴포넌트 ----------------
export function AdminCrudPage() {
  const [paginationModel, setPaginationModel] = React.useState<GridPaginationModel>({
    page: 0,
    pageSize: INITIAL_PAGE_SIZE,
  });
  const [filterModel, setFilterModel] = React.useState<GridFilterModel>({ items: [] });
  const [sortModel, setSortModel] = React.useState<GridSortModel>([]);

  const [rowsState, setRowsState] = React.useState<{ rows: Member[]; rowCount: number }>({
    rows: [],
    rowCount: 0,
  });

  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const loadData = React.useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      const listData = await getMembers({
        paginationModel,
        sortModel,
        filterModel,
      });

      setRowsState({
        rows: listData.items,
        rowCount: listData.itemCount,
      });
    } catch (listDataError) {
      setError(listDataError as Error);
    }

    setIsLoading(false);
  }, [paginationModel, sortModel, filterModel]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = React.useCallback(() => {
    if (!isLoading) loadData();
  }, [isLoading, loadData]);

  const handleRowClick = React.useCallback<GridEventListener<'rowClick'>>(
    ({ row }) => {
      console.log('Row clicked:', row);
    },
    [],
  );

  const handleCreateClick = React.useCallback(() => {
    console.log('Create new member clicked');
  }, []);

  const handleRowEdit = React.useCallback(
    (member: Member) => () => {
      console.log('Edit member:', member);
    },
    [],
  );

  // 🔹 삭제 버튼은 UI만, 실제 삭제 X
  const handleRowDelete = React.useCallback(
    (member: Member) => () => {
      window.alert(`Delete button clicked for ${member.name}. (Not implemented yet)`);
    },
    [],
  );

  // ---------------- 컬럼 정의 ----------------
  const columns = React.useMemo<GridColDef[]>(() => [
    { field: 'member_id', headerName: 'Member ID', width: 100 },
    { field: 'id', headerName: 'Login ID', width: 120 },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'phone', headerName: 'Phone', width: 140 },
    { field: 'email', headerName: 'Email', width: 180 },
    { field: 'member_grade', headerName: 'Grade', width: 100 },
    {
      field: 'actions',
      type: 'actions',
      flex: 1,
      align: 'right',
      getActions: ({ row }) => [
        <GridActionsCellItem
          key="edit-item"
          icon={<EditIcon />}
          label="Edit"
          onClick={handleRowEdit(row)}
        />,
        <GridActionsCellItem
          key="delete-item"
          icon={<DeleteIcon />}
          label="Delete"
          onClick={handleRowDelete(row)}
        />,
      ],
    },
  ], [handleRowEdit, handleRowDelete]);

  const pageTitle = 'Members';

  return (
    <PageContainer
      title={pageTitle}
      breadcrumbs={[{ title: pageTitle }]}
      actions={
        <Stack direction="row" alignItems="center" spacing={1}>
          <Tooltip title="Reload data" placement="right" enterDelay={1000}>
            <div>
              <IconButton size="small" aria-label="refresh" onClick={handleRefresh}>
                <RefreshIcon />
              </IconButton>
            </div>
          </Tooltip>
          <Button
            variant="contained"
            onClick={handleCreateClick}
            startIcon={<AddIcon />}
          >
            Create
          </Button>
        </Stack>
      }
    >
      <Box sx={{ flex: 1, width: '100%' }}>
        {error ? (
          <Box sx={{ flexGrow: 1 }}>
            <Alert severity="error">{error.message}</Alert>
          </Box>
        ) : (
          <DataGrid
            rows={rowsState.rows}
            rowCount={rowsState.rowCount}
            getRowId={(row) => row.member_id} // 🔹 member_id를 고유 ID로 사용
            columns={columns}
            pagination
            sortingMode="server"
            filterMode="server"
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            sortModel={sortModel}
            onSortModelChange={setSortModel}
            filterModel={filterModel}
            onFilterModelChange={setFilterModel}
            disableRowSelectionOnClick
            onRowClick={handleRowClick}
            loading={isLoading}
            pageSizeOptions={[5, INITIAL_PAGE_SIZE, 25]}
            sx={{
              [`& .${gridClasses.columnHeader}, & .${gridClasses.cell}`]: {
                outline: 'transparent',
              },
              [`& .${gridClasses.columnHeader}:focus-within, & .${gridClasses.cell}:focus-within`]: {
                outline: 'none',
              },
              [`& .${gridClasses.row}:hover`]: {
                cursor: 'pointer',
              },
            }}
          />
        )}
      </Box>
    </PageContainer>
  );
}
