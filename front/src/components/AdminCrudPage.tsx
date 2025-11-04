import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import TablePagination from '@mui/material/TablePagination';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
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
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import PageContainer from './PageContainer';

const INITIAL_PAGE_SIZE = 10;

// ---------------- API 관련 ----------------
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
  searchText?: string;
}

async function getMembers(params: GetMembersParams): Promise<MemberListResponse> {
  const { paginationModel, searchText } = params;
  const skip = paginationModel.page * paginationModel.pageSize;
  const limit = paginationModel.pageSize;

  let url = '';
  const query = new URLSearchParams({ skip: String(skip), limit: String(limit) });

  if (searchText && searchText.trim() !== '') {
    query.append('query', searchText.trim());
    url = `http://localhost:8000/admin/search/members?${query.toString()}`;
  } else {
    url = `http://localhost:8000/admin/members?${query.toString()}`;
  }

  const res = await fetch(url, {
    credentials: 'include',
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch members: ${res.status} ${res.statusText}`);
  }

  const text = await res.text();
  try {
    const data = JSON.parse(text);
    return data;
  } catch {
    throw new Error('Server did not return valid JSON. Response was probably HTML.');
  }
}

async function deleteMember(memberId: number) {
  const res = await fetch(`http://localhost:8000/admin/delete/${memberId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`삭제 실패 (${res.status}): ${text}`);
  }

  return res.json();
}

// ---------------- 커스텀 페이지네이션 ----------------
function TablePaginationActionsDummy() {
  return null;
}

function CustomPagination(props: {
  paginationModel: GridPaginationModel;
  rowCount: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newPageSize: number) => void;
}) {
  const { paginationModel, rowCount, onPageChange, onPageSizeChange } = props;
  const { page, pageSize } = paginationModel;
  const pageCount = Math.ceil(rowCount / pageSize);

  const handleFirstPage = () => onPageChange(0);
  const handleLastPage = () => onPageChange(Math.max(pageCount - 1, 0));
  const handlePrevPage = () => onPageChange(Math.max(page - 1, 0));
  const handleNextPage = () => onPageChange(Math.min(page + 1, pageCount - 1));

  return (
    <Stack direction="row" alignItems="center" spacing={1} justifyContent="flex-end" sx={{ p: 1 }}>
      <TablePagination
        component="div"
        count={rowCount}
        page={page}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        rowsPerPage={pageSize}
        onRowsPerPageChange={(event) => onPageSizeChange(Number(event.target.value))}
        rowsPerPageOptions={[5, 10, 25]}
        labelRowsPerPage="페이지당 항목 수"
        labelDisplayedRows={() => ''}
        ActionsComponent={TablePaginationActionsDummy}
        sx={{ mr: 1 }}
      />
      <IconButton onClick={handleFirstPage} disabled={page === 0}><FirstPageIcon /></IconButton>
      <IconButton onClick={handlePrevPage} disabled={page === 0}><KeyboardArrowLeft /></IconButton>
      <Box sx={{ mx: 1 }}>전체 {pageCount || 1} 페이지 중 {page + 1} 페이지</Box>
      <IconButton onClick={handleNextPage} disabled={page >= pageCount - 1}><KeyboardArrowRight /></IconButton>
      <IconButton onClick={handleLastPage} disabled={page >= pageCount - 1}><LastPageIcon /></IconButton>
    </Stack>
  );
}

// ---------------- AdminCrudPage ----------------
export function AdminCrudPage() {
  const [paginationModel, setPaginationModel] = React.useState<GridPaginationModel>({
    page: 0,
    pageSize: INITIAL_PAGE_SIZE,
  });
  const [filterModel, setFilterModel] = React.useState<GridFilterModel>({ items: [] });
  const [sortModel, setSortModel] = React.useState<GridSortModel>([]);
  const [searchText, setSearchText] = React.useState('');
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
      const listData = await getMembers({ paginationModel, sortModel, filterModel, searchText });
      setRowsState({ rows: listData.items, rowCount: listData.itemCount });
    } catch (err) {
      setError(err as Error);
    }
    setIsLoading(false);
  }, [paginationModel, sortModel, filterModel, searchText]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = React.useCallback(() => {
    if (!isLoading) loadData();
  }, [isLoading, loadData]);

  const handleRowClick = React.useCallback<GridEventListener<'rowClick'>>(
    ({ row }) => console.log('Row clicked:', row),
    []
  );
  const handleCreateClick = React.useCallback(() => console.log('Create new member clicked'), []);
  const handleRowEdit = React.useCallback((member: Member) => () => console.log('Edit member:', member), []);
  const handleRowDelete = React.useCallback((member: Member) => async () => {
    if (!window.confirm(`정말로 ${member.name} 회원을 삭제하시겠습니까?`)) return;
    try {
      await deleteMember(member.member_id);
      alert(`${member.name} 회원이 삭제되었습니다.`);
      loadData();
    } catch (err: any) {
      alert(`삭제 실패: ${err.message}`);
    }
  }, [loadData]);

  const columns = React.useMemo<GridColDef[]>(() => [
    { field: 'member_id', headerName: 'Member ID', width: 110 },
    { field: 'id', headerName: 'Login ID', width: 120 },
    { field: 'name', headerName: 'Name', width: 140 },
    { field: 'phone', headerName: 'Phone', width: 150 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'member_rating_name', headerName: 'Grade', width: 150 },
    {
      field: 'actions',
      type: 'actions',
      flex: 1,
      align: 'right',
      getActions: ({ row }) => [
        <GridActionsCellItem key="edit" icon={<EditIcon />} label="Edit" onClick={handleRowEdit(row)} />,
        <GridActionsCellItem key="delete" icon={<DeleteIcon />} label="Delete" onClick={handleRowDelete(row)} />,
      ],
    },
  ], [handleRowEdit, handleRowDelete]);

  const pageTitle = '관리자 페이지';
  const adminTitle = '회원목록';

  return (
    <PageContainer
      title={adminTitle}
      breadcrumbs={[{ title: pageTitle }]}
      actions={
        <Stack direction="row" alignItems="center" spacing={1}>
          <Tooltip title="Reload data" placement="right" enterDelay={1000}>
            <div>
              <IconButton size="small" aria-label="refresh" onClick={handleRefresh}><RefreshIcon /></IconButton>
            </div>
          </Tooltip>

          <Button variant="contained" onClick={handleCreateClick} startIcon={<AddIcon />}>
            회원추가
          </Button>

          <Box sx={{ ml: 1 }}>
            <TextField
                size="small"
                placeholder="Login ID / Name 검색"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    loadData();
                }
                }}
                InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                    <SearchIcon />
                    </InputAdornment>
                ),
                }}
                sx={{ width: 210, ml: 1 }}
            />
          </Box>
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
            getRowId={(row) => row.member_id}
            columns={columns}
            pagination
            sortingMode="server"
            sortModel={sortModel}
            onSortModelChange={setSortModel}
            filterMode="server"
            filterModel={filterModel}
            onFilterModelChange={setFilterModel}
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            disableRowSelectionOnClick
            onRowClick={handleRowClick}
            loading={isLoading}
            pageSizeOptions={[5, 10, 25]}
            sx={{
              [`& .${gridClasses.columnHeader}, & .${gridClasses.cell}`]: { outline: 'transparent' },
              [`& .${gridClasses.row}:hover`]: { cursor: 'pointer' },
            }}
            slots={{
              footer: () => (
                <CustomPagination
                  paginationModel={paginationModel}
                  rowCount={rowsState.rowCount}
                  onPageChange={(newPage) => setPaginationModel(prev => ({ ...prev, page: newPage }))}
                  onPageSizeChange={(newPageSize) =>
                    setPaginationModel(prev => ({ ...prev, pageSize: newPageSize, page: 0 }))
                  }
                />
              ),
            }}
          />
        )}
      </Box>
    </PageContainer>
  );
}
