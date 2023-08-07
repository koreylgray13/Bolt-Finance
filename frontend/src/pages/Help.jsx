import { Box, useTheme } from "@mui/material";
import Typography from "@mui/material/Typography";
import { tokens } from "../theme";
import Layout from "../components/base/Layout";
import { useTranslation } from "react-i18next";
import * as React from "react";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";


const Help = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const {t} = useTranslation()

  return (
      <Layout>

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
      <Typography
        variant="h2"
        color={colors.grey[100]}
        fontWeight="bold"
        sx={{ m: "0 0 5px 0" }}
      >
          {t('request_support')}
        </Typography>
        <Box component="form" sx={{ mt: 3 }}>
          <Grid container spacing={2}>



            <Grid item xs={12}>
              <TextField
                fullWidth
                id="email"
                label={t('subject')}
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
    </Container>
    </Layout>
  );
};

export default Help;
