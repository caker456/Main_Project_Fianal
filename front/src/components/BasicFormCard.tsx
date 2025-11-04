'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface User {
  name: string;
  avatar: string;
  email: string;
  phone: string;
}

export function BasicFormCard(): React.JSX.Element {
  const [user, setUser] = useState<User | null>(null);

  const handleUploadPicture = () => {
    // 업로드 로직 추가
    alert('Upload picture clicked!');
  };

  useEffect(() => {
    fetch('http://localhost:8000/member/me', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch user info');
        return res.json();
      })
      .then((data) => {
        setUser({
          name: data.name || '',
          avatar: data.avatar || '/assets/avatar.png',
          email: data.email || '',
          phone: data.phone || '',
        });
      })
      .catch((err) => console.error(err));
  }, []);

  if (!user) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Card sx={{ width: '100%', borderRadius: 4, overflow: 'hidden' }}>
      <CardContent sx={{ pt: 4 }}>
        <Stack spacing={2} alignItems="center">
          <Avatar src={user.avatar} sx={{ height: 80, width: 80 }} />
          <Stack spacing={0.5} textAlign="center">
            <Typography variant="h5" fontWeight={600}>
              {user.name}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {user.email}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {user.phone}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
      <Divider />
      <CardActions sx={{ justifyContent: 'center', p: 2 }}>
        <Typography
          variant="body2"
          color="primary"
          sx={{ cursor: 'pointer', fontWeight: 500 }}
          onClick={handleUploadPicture}
        >
          Upload picture
        </Typography>
      </CardActions>
    </Card>
  );
}
