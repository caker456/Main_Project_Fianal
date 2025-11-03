import * as React from 'react';
import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid'; // 안정적인 Grid 사용
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';

interface AccountDetailsFormProps {
  goHome: () => void;
  setLoggedIn: (value: boolean) => void;
  setCurrentPage: (
    page: 'home' | 'management' | 'history' | 'documents' | 'statistics' | 'signup' | 'profile'
  ) => void;
}

export function AccountDetailsCard({
  goHome,
}: AccountDetailsFormProps): React.JSX.Element {
  const [formData, setFormData] = useState({
    id: '',
    password: '',
    name: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    fetch('http://localhost:8000/member/me', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch user info');
        return res.json();
      })
      .then((data) => {
        setFormData({
          id: data.id || '',
          password: '',
          name: data.name || '',
          phone: data.phone || '',
          email: data.email || '',
        });
      })
      .catch((err) => console.error(err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/member/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error(`Update failed with status ${res.status}`);
      alert('회원 정보 변경에 성공했습니다.');
      goHome();
    } catch (err) {
      console.error(err);
      alert('회원 정보 변경에 실패했습니다. 고객센터에 문의해 주세요');
    }
  };

  const handleDelete = async () => {
    if (!confirm('정말 회원 탈퇴를 하시겠습니까? 삭제 후 복구할 수 없습니다.')) return;
    try {
      const res = await fetch(`http://localhost:8000/member/delete/${formData.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        alert('회원 탈퇴에 성공했습니다.');
        window.location.reload();
        return;
      }

      console.error('❌ Delete failed:', res.status, res.statusText);
      alert('회원 탈퇴에 실패했습니다.');
    } catch (err) {
      console.error('❌ Delete error:', err);
      alert('회원 탈퇴에 실패했습니다.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card sx={{ borderRadius: 4 }}> {}
        <CardHeader subheader="The information can be edited" title="Profile" />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            {/* ID */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required variant="outlined" sx={{ mb: 2 }}>
                <InputLabel htmlFor="id">ID</InputLabel>
                <OutlinedInput
                  id="id"
                  value={formData.id}
                  name="id"
                  label="ID"
                  disabled
                  sx={{ minHeight: 50 }}
                />
              </FormControl>
            </Grid>

            {/* Password */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                <InputLabel htmlFor="password">Password</InputLabel>
                <OutlinedInput
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  name="password"
                  label="Password"
                  type="password"
                  sx={{ minHeight: 50 }}
                />
              </FormControl>
            </Grid>

            {/* Name */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required variant="outlined" sx={{ mb: 2 }}>
                <InputLabel htmlFor="name">Name</InputLabel>
                <OutlinedInput
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  name="name"
                  label="Name"
                  sx={{ minHeight: 50 }}
                />
              </FormControl>
            </Grid>

            {/* Phone */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                <InputLabel htmlFor="phone">Phone number</InputLabel>
                <OutlinedInput
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  name="phone"
                  label="Phone number"
                  type="tel"
                  sx={{ minHeight: 50 }}
                />
              </FormControl>
            </Grid>

            {/* Email */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required variant="outlined" sx={{ mb: 2 }}>
                <InputLabel htmlFor="email">Email address</InputLabel>
                <OutlinedInput
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  name="email"
                  label="Email address"
                  type="email"
                  sx={{ minHeight: 50 }}
                />
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
          <Button type="button" variant="contained" color="error" onClick={handleDelete}>
            회원 탈퇴
          </Button>
          <Button variant="contained" type="submit">
            회원 정보 변경
          </Button>
        </CardActions>
      </Card>
    </form>
  );
}
