import { styled } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';

export const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
    '& .MuiDataGrid-columnHeader': {
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.common.white,
      fontWeight: 'bold',
      fontSize: 15,
    },
    '& .MuiDataGrid-columnHeaderTitle': {
        whiteSpace: 'pre-line',
        lineHeight: '1.4',
        textAlign: 'center'
    },
    '& .MuiDataGrid-cell:focus': {
        outline: 'none'
    }
}));

export const StyledGridOverlay = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    '& .ant-empty-img-1': {
      fill: theme.palette.mode === 'light' ? '#aeb8c2' : '#262626',
    },
    '& .ant-empty-img-2': {
      fill: theme.palette.mode === 'light' ? '#f5f5f7' : '#595959',
    },
    '& .ant-empty-img-3': {
      fill: theme.palette.mode === 'light' ? '#dce0e6' : '#434343',
    },
    '& .ant-empty-img-4': {
      fill: theme.palette.mode === 'light' ? '#fff' : '#1c1c1c',
    },
    '& .ant-empty-img-5': {
      fillOpacity: theme.palette.mode === 'light' ? '0.8' : '0.08',
      fill: theme.palette.mode === 'light' ? '#f5f5f5' : '#fff',
    },
  }));