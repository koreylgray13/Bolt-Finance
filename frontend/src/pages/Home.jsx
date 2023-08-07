import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../theme";
import Layout from "../components/base/Layout";
import Header from "../components/base/Header";
import {
  BalanceOverview,
  MiniTransactionTable,
  MiniAccountsTable,
  BalanceHistoryLineChart,
} from "../data/BoltV2";
import { AccountTypePieChart } from "../data/BoltV2";
import { TransactionBarChart } from "../data/BoltV2";
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { t } = useTranslation();

  return (
    <Layout>
      <Box m="20px" marginLeft={2.5}
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
        }}>
      {/* HEADER */}
      
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title={t('dashboard')} subtitle={t('welcome')} />
      </Box>

      {/* GRID & CHARTS */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(15, 1fr)"
        gridAutoRows="150px"
        gap="20px"
      >
        {/* ROW 1 */}
        <BalanceOverview />

        {/* ROW 2 */}
        <Box
          gridColumn="span 6"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Box
            mt="15px"
            p="0 15px"
            display="flex "
            justifyContent="space-between"
            alignItems="center"
            
          >
            <Box >
              <Typography
                variant="h5"
                fontWeight="600"
                color={colors.grey[100]}
              >
                {t('balance_history')}
              </Typography>

            </Box>

          </Box>
          <Box height="315px" m="-20px 0 0 0">
            <BalanceHistoryLineChart  isDashboard={true} />
          </Box>
        </Box>
        <Box alignContent="center" 
          gridColumn="span 5"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          sx={{ padding: "15px 30px 0 20px" }}
          >
          <Typography variant="h5" fontWeight="600">
          {t('accounts')}
          </Typography>
          {/* <Box> */}
            <AccountTypePieChart />
          {/* </Box> */}
          
        </Box>
        <Box 
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          overflow="auto"
        >
          <MiniAccountsTable />
        </Box>

        {/* ROW 3 */}

        <Box
          gridColumn="span 8"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{ padding: "15px 30px 0 20px" }}
          >
            {t('trans_by_category')}
          </Typography>
          <Box height="320px" mt="-30px">
            <TransactionBarChart isDashboard={true} />
          </Box>
        </Box>
        <Box
          gridColumn="span 7"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          overflow="auto"

        >
          <MiniTransactionTable />
        </Box>
      </Box>
    </Box>
    </Layout>
  );
};

export default Dashboard;
