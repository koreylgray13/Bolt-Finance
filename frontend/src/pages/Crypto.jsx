import { Box, useTheme, Typography } from "@mui/material"; //Button
import { tokens } from "../theme";
import Header from "../components/base/Header";
import { WalletsToTable, WalletConnect, CryptoPortfolioLineChart } from "../data/BoltV2";
import Layout from "../components/base/Layout";
// import { useNavigate } from "react-router-dom";
import {useTranslation} from 'react-i18next'

const Crypto = ()=> {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const {t} = useTranslation();

  return (
    <Layout>
      <Box m="0 15px 0 15px">
        {/* HEADER */}

        <Box>
        <Typography
          variant="h2"
          color={colors.grey[100]}
          fontWeight="bold"
          sx={{ m: "0 0 5px 0" }}
        >
          {t("crypto_portfolio")}
        </Typography>
        <Box height="325px" m="-20px 0 0 0">
            <CryptoPortfolioLineChart isDashboard={true} />
          </Box>
          {/* <CryptoPortfolioLineChart /> */}
        </Box>

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            marginTop: 1,
            marginBottom: 0.5,
          }}
        >
          <Header
            title={t('connected_wallets')}
          />
          <Box>
            <WalletConnect />
          </Box>
        </Box>

        <Box
          m="0 0 0 0"
          display="grid"
          gridTemplateColumns="repeat(15, 1fr)"
          gridAutoRows="150px"
          gap="20px"
          height="75vh"
          sx={{
            "& .MuiDataGrid-root": {
              border: "none",
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "none",
            },
            "& .name-column--cell": {
              color: colors.greenAccent[300],
            },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: colors.blueAccent[700],
              borderBottom: "none",
            },
            "& .MuiDataGrid-virtualScroller": {
              backgroundColor: colors.primary[400],
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: "none",
              backgroundColor: colors.blueAccent[700],
            },
            "& .MuiCheckbox-root": {
              color: `${colors.greenAccent[200]} !important`,
            },
            "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
              color: `${colors.grey[100]} !important`,
            },
          }}
        >
          <Box gridColumn="span 10" gridRow="span 2">
            <WalletsToTable />
          </Box>

          <Box gridColumn="span 5" gridRow="span 2">
          <Typography variant="h5" fontWeight="600" align="center">
          {t('manage')}
          </Typography>


          </Box>
        </Box>
        <Box></Box>
      </Box>
    </Layout>
  );
}

export default Crypto;