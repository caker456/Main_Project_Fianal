'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';

interface AccountDetailsFormProps {
  goHome: () => void; // 부모 컴포넌트에서 전달
}

export function AccountDetailsForm({ goHome }: AccountDetailsFormProps): React.JSX.Element {
  const [formData, setFormData] = useState({
    id: '',
    password: '',
    name: '',
    phone: '',
    email: '',
    state: '',
    city: '',
  });

  useEffect(() => {
    fetch('http://localhost:8000/me', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setFormData({
          id: data.id || '',
          password: '',
          name: data.name || '',
          phone: data.phone || '',
          email: data.email || '',
          state: data.state || '',
          city: data.city || '',
        });
      })
      .catch(err => console.error(err));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>
  ) => {
    const name = e.target.name!;
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      if (!res.ok) throw new Error('Update failed');
      alert('Profile updated successfully');
      goHome(); // 홈으로 이동
    } catch (err) {
      console.error(err);
      alert('Profile update failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader subheader="The information can be edited" title="Profile" />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item md={12} xs={12}>
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

            <Grid item md={12} xs={12}>
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

            <Grid item md={12} xs={12}>
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

            <Grid item md={12} xs={12}>
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

            <Grid item md={12} xs={12}>
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
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button variant="contained" type="submit">
            Save details
          </Button>
        </CardActions>
      </Card>
    </form>
  );
}
