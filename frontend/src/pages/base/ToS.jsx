import * as React from "react";
import { Box, Typography } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import Container from "@mui/material/Container";
import Copyright from "../../components/base/Copyright";
import { useTranslation } from 'react-i18next';
import Footer from "../../components/base/Footer";

export default function TermsOfService() {
  const {t} = useTranslation()
  return (
    <Container component="main">

      <CssBaseline />
      <Box m="30px 0 0 0">
        <Typography
          align="center"
          variant="h1"
          fontWeight="bold"
          sx={{ m: "0 0 5px 0" }}
        >
          {t('terms_of_service')}
        </Typography>
        <Typography
          align="center"
          variant="h2"
          fontWeight="bold"
          sx={{ m: "50px 0 0 0" }}
        >
          {t('overview')}
        </Typography>
        <Typography variant="h5" align="center">
            {t('tos_overview')}
        </Typography>
        <Typography
          align="center"
          variant="h3"
          fontWeight="bold"
          sx={{ m: "50px 0 0 0" }}
        >
          {t('tos_section1_title')}
        </Typography>
        <Typography variant="h5" align="center">
{t('tos_section1_body')}}
        </Typography>
        <Typography
          align="center"
          variant="h3"
          fontWeight="bold"
          sx={{ m: "50px 0 0 0" }}
        >
          {t('tos_section2_title')}
        </Typography>
        <Typography variant="h5" align="center">
{t('tos_section2_body')}}
        </Typography>
        <Typography
          align="center"
          variant="h3"
          fontWeight="bold"
          sx={{ m: "50px 0 0 0" }}
        >
          {t('tos_section3_title')}
        </Typography>
        <Typography variant="h5" align="center">
{t('tos_section3_body')}}
        </Typography>
        <Typography
          align="center"
          variant="h3"
          fontWeight="bold"
          sx={{ m: "50px 0 0 0" }}
        >
          {t('tos_section4_title')}
        </Typography>
        <Typography variant="h5" align="center">
{t('tos_section4_body')}}
        </Typography>

        <Typography
          align="center"
          variant="h3"
          fontWeight="bold"
          sx={{ m: "50px 0 0 0" }}
        >
          {t('tos_section5_title')}
        </Typography>
        <Typography variant="h5" align="center">
{t('tos_section5_body')}}
        </Typography>
        <Typography
          align="center"
          variant="h3"
          fontWeight="bold"
          sx={{ m: "50px 0 0 0" }}
        >
{t('tos_section6_title')}
        </Typography>
        <Typography variant="h5" align="center">
{t('tos_section6_body')}}
        </Typography>
        <Typography
          align="center"
          variant="h3"
          fontWeight="bold"
          sx={{ m: "50px 0 0 0" }}
        >
{t('tos_section7_title')}
        </Typography>
        <Typography variant="h5" align="center">
            {t('tos_section7_body')}}
        </Typography>
        <Typography
          align="center"
          variant="h3"
          fontWeight="bold"
          sx={{ m: "50px 0 0 0" }}
        >

        </Typography>
        <Typography variant="h5" align="center">
            
        </Typography>
        <Typography
          align="center"
          variant="h3"
          fontWeight="bold"
          sx={{ m: "50px 0 0 0" }}
        >

        </Typography>
        <Typography variant="h5" align="center"></Typography>
        <Typography
          align="center"
          variant="h3"
          fontWeight="bold"
          sx={{ m: "50px 0 0 0" }}
        ></Typography>
        <Typography variant="h5" align="center"></Typography>
        <Typography
          align="center"
          variant="h3"
          fontWeight="bold"
          sx={{ m: "50px 0 0 0" }}
        ></Typography>
        <Typography variant="h5" align="center"></Typography>
        <Typography
          align="center"
          variant="h3"
          fontWeight="bold"
          sx={{ m: "50px 0 0 0" }}
        ></Typography>
        <Typography variant="h5" align="center"></Typography>
        <Typography
          align="center"
          variant="h3"
          fontWeight="bold"
          sx={{ m: "50px 0 0 0" }}
        ></Typography>
        <Typography variant="h5" align="center"></Typography>
        <Typography
          align="center"
          variant="h3"
          fontWeight="bold"
          sx={{ m: "50px 0 0 0" }}
        ></Typography>
        <Typography variant="h5" align="center"></Typography>
      </Box>
      <Footer />
      <Copyright sx={{ mt: 8, mb: 4}} />
    </Container>
  );
}
