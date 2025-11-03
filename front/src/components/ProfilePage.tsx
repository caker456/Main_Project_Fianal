import * as React from 'react';
import Grid from '@mui/material/Grid';
import { BasicFormCard } from './BasicFormCard';
import { AccountDetailsCard } from './AccountDetailsCard';

export function ProfilePage() {
  return (
    <Grid container spacing={3} sx={{ p: 3, display: 'flex', flexWrap: 'wrap', gap: 3 }}>
      {/* 왼쪽 */}
      <div style={{ flex: '1 1 45%', minWidth: 300 }}>
        <BasicFormCard />
      </div>

      {/* 오른쪽 */}
      <div style={{ flex: '1 1 45%', minWidth: 300 }}>
        <AccountDetailsCard
          goHome={() => console.log('홈으로 이동')}
          setLoggedIn={(value) => console.log('로그인 상태:', value)}
          setCurrentPage={(page) => console.log('페이지 변경:', page)}
        />
      </div>
    </Grid>
  );
}
