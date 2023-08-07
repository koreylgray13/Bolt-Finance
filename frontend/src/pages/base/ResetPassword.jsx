import * as React from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Copyright from '../../components/base/Copyright';
import {useTranslation} from 'react-i18next'
import { useContext } from "react";
import AuthContext from "../../context/AuthContext";

export default function ResetPassword() {
  const {t} = useTranslation();
  let {resetPassword} = useContext(AuthContext)
    return (
        <Container component="main">
          <CssBaseline />

        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >

          <Typography component="h1" variant="h5">
            {t('confirm_email')}
          </Typography>
          <Box component="form" onSubmit={resetPassword} noValidate sx={{ mt: 1 }}>
            <TextField
              
              margin="normal"
              required
              fullWidth
              id="email"
              label={t('email_address')}
              name="email"
              autoComplete="email"
              autoFocus
            />

                  <Button
                      color="success"
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              {t('reset_password')}
            </Button>

          </Box>
        </Box>
        <Copyright sx={{ mt: 8, mb: 4 }} />
      </Container>
  );
}

