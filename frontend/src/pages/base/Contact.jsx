import * as React from "react";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Copyright from '../../components/base/Copyright';
import {useTranslation} from 'react-i18next'

export default function SignUp() {
  const {t} = useTranslation();


  const handleSubmit = (data) => {
    console.log(data);
  };



  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5">
          {t('contact_us')}
        </Typography>
        <Box component="form" sx={{ mt: 3 }} onSubmit={handleSubmit()}>
          <Grid container spacing={2}>



            <Grid item xs={12}>
              <TextField
                fullWidth
                id="email"
                label={t('email_address')}
                name="email"
                autoComplete="email"

              />

            </Grid>

            <Grid item xs={12}>
        <TextField
        fullWidth
          id="outlined-textarea"
          placeholder={t('message')}
          multiline
          rows={6}
        />

            </Grid>


          </Grid>
          <Button
            color="success"
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled
          >
            {t('submit')}
          </Button>

        </Box>
      </Box>
      <Copyright sx={{ mt: 5 }} />
    </Container>
  );
}
