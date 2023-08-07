import { Box, useTheme } from "@mui/material";
import { tokens } from "../theme";
import Header from "../components/base/Header";
import { TransactionsToTable } from "../data/BoltV2"
import Layout from "../components/base/Layout";
import { useTranslation } from "react-i18next";



const Transactions = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const {t} = useTranslation()
  return ( 
    <Layout>

    
    <Box m="0 15px 0 15px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title={t('transactions')} subtitle={t('transaction_summary_message')} />
        <Box>

          </Box>
      </Box>

      <Box
        m="0 0 0 0"
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
        
    <TransactionsToTable />

      </Box>
    </Box>
    </Layout>
 
  );
};

export default Transactions;
