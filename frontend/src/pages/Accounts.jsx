import { Box, Button, useTheme, Typography } from "@mui/material";
import { tokens } from "../theme";
import Header from "../components/base/Header";
import { AccountsToTable, AccountOverview, AccountTypePieChart, AccountSubtypePieChart } from "../data/BoltV2";
import Layout from "../components/base/Layout";
import { useNavigate } from "react-router-dom";
import {useTranslation} from 'react-i18next'


const Accounts = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const {t} = useTranslation();

  return (
    <Layout>
      <Box m="0 15px 0 15px">
        {/* HEADER */}

        <Box>
          <AccountOverview />
        </Box>

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            marginTop: 2,
            marginBottom: 0.5,
          }}
        >
          <Header
            title={t('overview')}
            subtitle={t('account_summary_message')}
          />
          <Box>
            <Button
              onClick={() => navigate("/newAccount")}
              sx={{
                backgroundColor: colors.blueAccent[700],
                color: colors.grey[100],
                fontSize: "14px",
                fontWeight: "bold",
                marginLeft: "15px",
              }}
            >
              {t('add_account')}
            </Button>

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
          <Box gridColumn="span 11" gridRow="span 2">
            <AccountsToTable />
          </Box>

          <Box gridColumn="span 4" gridRow="span 2">
          <Typography variant="h5" fontWeight="600" align="center">
          {t('account_type')}
          </Typography>
          <AccountTypePieChart />
          <Typography variant="h5" fontWeight="600" align="center">
          {t('account_subtype')}
          </Typography>
            <AccountSubtypePieChart />

          </Box>
        </Box>
        <Box></Box>
      </Box>
    </Layout>
  );
};

export default Accounts;
