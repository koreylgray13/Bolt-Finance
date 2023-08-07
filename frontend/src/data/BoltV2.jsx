import React, { useState, useEffect, useCallback } from "react";
import { useQuery } from "react-query";
import { tokens } from "../theme";
import StatBox from "../components/visuals/StatBox";
import {
  getAccountTotals,
  getAccounts,
  getTransactions,
  axiosInstance,
  UpdateTransactions,
  UpdateAccounts,
} from "./baseQuery";
import { Box, Typography, useTheme, Button, IconButton } from "@mui/material";
import {
  DataGrid,
  GridActionsCellItem,
  GridToolbarExport,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
} from "@mui/x-data-grid";
import { ResponsivePie } from "@nivo/pie";
import { CircularProgressLoadingEffect } from "../components/fx/LoadingEffect";
import { useTranslation } from "react-i18next";
import { usePlaidLink } from "react-plaid-link";
import { useNavigate } from "react-router-dom";
import useAxios from "../utils/useAxios";
import DeleteIcon from "@mui/icons-material/Delete";
import swal from "sweetalert";
import { useEthereumProvider } from "react-plaid-link/web3";
import { ResponsiveBar } from "@nivo/bar";
import moment from "moment";
import { ResponsiveLine } from "@nivo/line";

const PlaidLink = () => {
  const { t } = useTranslation();
  // Retrieve Link Token
  const navigate = useNavigate();
  let [linkToken, setLinkToken] = useState([]);
  useEffect(() => {
    async function fetchData() {
      let data = await axiosInstance.get("/api/plaid/link/create/");
      setLinkToken(data.data);
    }
    fetchData();
  }, []);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: (public_token, metadata) => {
      // PASS PUBLIC TOKEN TO SERVER SIDE
      axiosInstance.post("api/plaid/item/create/", metadata);
      swal(t("success"), t("account_creation_successful"), "success");
      navigate("/accounts");
    },
  });



  return (
    <Button
      onClick={() => open()}
      disabled={!ready}
      style={{
        marginTop: 10,
        borderRadius: 10,
        backgroundColor: "#21b6ae",
        fontSize: "12px",
      }}
    >
      Launch Link
    </Button>
  );
};

const WalletConnect = () => {
  const [accounts, setAccounts] = useState();
  const onSuccess = useCallback(
    async (provider) => {
      const accounts = await provider.request({
        method: "eth_accounts",
      });
      setAccounts(accounts);
    },
    [setAccounts]
  );
  console.log(accounts);
  const { open, ready } = useEthereumProvider({
    token: "link-sandbox-9039a347-5f50-4a1a-b2b9-a4f14e2ba471",
    chain: {
      chainId: "0x1",
      rpcUrl: "",
    },
    onSuccess,
  });

  return (
    <Button
      variant="contained"
      size="medium"
      color="success"
      onClick={() => open()}
      disabled={!ready}
    >
      Connect wallet
    </Button>
  );
};

const AccountsToTable = () => {
  let api = useAxios();
  const {
    status,
    refetch,
    data: accounts,
  } = useQuery({
    queryKey: ["accounts"],
    queryFn: getAccounts,
    initialData: [],
  });
  const { t } = useTranslation();
  const [rows, setRows] = useState(accounts || []);


  useEffect(() => {
    if (accounts) {
      setRows(accounts);
    }
  }, [accounts]);

  const handleDeleteClick = (id) => () => {
    try {
      swal({
        title: t("warning"),
        text: t("account_delete_warning"),
        icon: "warning",
        buttons: true,
        dangerMode: true,
      }).then((willDelete) => {
        if (willDelete) {
          swal(t("deleting_account"), {
            icon: "success",
          });
          setRows(accounts?.filter((account) => account.id !== id));
          let deletedRow = accounts?.filter((account) => account.id === id);
          api.post("/api/plaid/accounts/delete/", deletedRow);
          refetch();
        }
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (status === "loading") {
    return <CircularProgressLoadingEffect />;
  }

  if (status === "error") {
    // TODO: Add error handling
  }

  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
        <GridToolbarExport />
        <Box justifyContent="flex-end">
          <UpdateAccounts />
        </Box>
      </GridToolbarContainer>
    );
  }

  const columns = [
    {
      field: "name",
      headerName: t("name"),
      width: 180,
      flex: 1,
    },
    {
      field: "official_name",
      headerName: t("official_name"),
      width: 180,
      flex: 1,
      hide: true,
    },
    {
      field: "institution",
      headerName: t("institution"),
      flex: 0.75,
    },
    {
      field: "current",
      headerName: t("current"),
      type: "number",
      flex: 0.5,
    },
    {
      field: "available",
      headerName: t("available"),
      type: "number",
      flex: 0.5,
    },
    {
      field: "limit",
      headerName: t("limit"),
      type: "number",
      flex: 0.5,
      hide: true,
    },
    {
      field: "type",
      headerName: t("type"),
      type: "text",
      flex: 0.5,
    },
    {
      field: "subtype",
      headerName: t("subtype"),
      type: "text",
      flex: 0.5,
    },
    {
      field: "unofficial_currency_code",
      headerName: t("unofficial_currency_code"),
      type: "text",
      flex: 0.5,
      hide: true,
    },
    {
      field: "iso_currency_code",
      headerName: t("iso_currency_code"),
      type: "text",
      flex: 0.5,
      hide: true,
    },
    {
      field: "verification_status",
      headerName: t("verification_status"),
      type: "text",
      flex: 0.5,
      hide: true,
    },
    {
      field: "class_type",
      headerName: t("class_type"),
      type: "text",
      flex: 0.5,
      hide: true,
    },


    {
      field: "actions",
      type: "actions",
      headerName: t("actions"),
      cellClassName: "actions",
      getActions: ({ id }) => {
        return [
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];



    return (
      <div style={{ height: 500, width: "100%" }}>
      <DataGrid
        density="compact"
        rows={rows}
        columns={columns}
        pageSize={100}
        components={{ Toolbar: CustomToolbar }}
      />
      </div>
    );
};

const TransactionsToTable = () => {
  const { t } = useTranslation();
  const { status, data: transactions } = useQuery({
    queryKey: ["transactions"],
    queryFn: getTransactions,
  });

  if (status === "loading") {
    return <CircularProgressLoadingEffect />;
  }

  if (status === "error") {
  }

  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
        <GridToolbarExport />
        <Box justifyContent="flex-end">
          <UpdateTransactions />
          <IconButton>
            <DeleteIcon />
          </IconButton>
        </Box>
      </GridToolbarContainer>
    );
  }

  const columns = [
    { field: "account", headerName: t("account"), flex: .5 },
    { field: "name", headerName: t("name"), flex: 1 },
    { field: "amount", headerName: t("amount"), flex: 0.5 },
    { field: "date", headerName: t("date"), flex: 0.5 },
    { field: "payment_channel", headerName: t("payment_method"), flex: 0.5 },
    { field: "transaction_type", headerName: t("transaction_type"), flex: 0.5 },
    { field: "transaction_id", headerName: t("transaction_id"), flex: 0.75 },
    { field: "category", headerName: t("categories"), flex: 0.75 },
    { field: "category_id", headerName: t("category_id") },
    { field: "merchant_name", headerName: t("merchant_name"), hide: true },
    { field: "pending", headerName: t("pending"), hide: true },
    { field: "pending_transaction_id", headerName: t("pending_transaction_id"), hide: true},
    { field: "personal_finance_category", headerName: t("personal_finance_category"), hide: true },
    { field: "transaction_code", headerName: t("transaction_code"), hide: true },
    { field: "unofficial_currency_code", headerName: t("unofficial_currency_code"), hide: true },
    { field: "check_number", headerName: t("check_number"), hide: true },
    { field: "location", headerName: t("location"), hide: true },
    { field: "payment_meta", headerName: t("payment_meta"), hide: true },
  ];
  return (
    <div style={{ height: 700, width: "100%" }}>
      <DataGrid
        density="compact"
        rows={transactions}
        columns={columns}
        pageSize={100}
        components={{ Toolbar: CustomToolbar }}
      />
    </div>
  );
};

const WalletsToTable = () => {
  const { t } = useTranslation();
  let data = [];

  const columns = [
    {
      field: "name",
      headerName: t("wallet_address"),
      width: 180,
      flex: 1,
    },
    {
      field: "institution",
      headerName: t("token"),
      flex: 0.5,
    },
    {
      field: "current",
      headerName: t("quanitity"),
      type: "number",
      flex: .5,
    },
    {
      field: "available",
      headerName: t("value"),
      type: "number",
      flex: 1,
    },



  ];


    return (
      <div style={{ height: 500, width: "100%" }}>
      <DataGrid
        density="compact"
        rows={data}
        columns={columns}
        pageSize={100}
      />
      </div>
    );
};

function BalanceOverview() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [totalDebt, setTotalDebt] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);
  const [totalCheckings, setTotalCheckings] = useState(0);
  const [totalInvestments, setTotalInvestments] = useState(0);
  const [netWorth, setNetWorth] = useState(0);
  const { t } = useTranslation();

  const { data: accountTotals } = useQuery(
    ["account totals"],
    getAccountTotals
  );

  useEffect(() => {
    const setTotals = async () => {
      setTotalCheckings(accountTotals?.checkings ?? 0);
      setTotalSavings(accountTotals?.savings ?? 0);
      setTotalInvestments(accountTotals?.investments ?? 0);
      setTotalDebt(accountTotals?.debt ?? 0);
      setNetWorth(accountTotals?.net_worth ?? 0);
    };
    setTotals();
  }, [accountTotals]);

  const renderStatBox = (title, subtitle) => (
    <Box
      gridColumn="span 3"
      backgroundColor={colors.primary[400]}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <StatBox title={title} subtitle={t(subtitle)} />
    </Box>
  );

  return (
    <>
      {renderStatBox(netWorth, "net_worth")}
      {renderStatBox(totalCheckings, "checkings")}
      {renderStatBox(totalSavings, "savings")}
      {renderStatBox(totalInvestments, "investments")}
      {renderStatBox(totalDebt, "debt")}
    </>
  );
}

function AccountOverview() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { t } = useTranslation();

  const { status, data: accounts } = useQuery({
    queryKey: ["accounts"],
    queryFn: getAccounts,
  });

  useEffect(() => {
    if (status === "error") {
      // handle error
    }
  }, [status]);

  return (
    <Box m="0 0 0 0" alignItems="center" justifyContent="center">
      <Box display="flex" justifyContent="center" alignItems="center">
        <Typography
          variant="h2"
          color={colors.grey[100]}
          fontWeight="bold"
          sx={{ m: "0 0 5px 0" }}
        >
          {t("connected_accounts")}
        </Typography>
      </Box>

      <Box
        display="grid"
        gridTemplateColumns="repeat(15, 1fr)"
        gridAutoRows="120px"
        gap="30px"
      >
        {/* ROW 1 */}
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {/* Net Worth */}
          <StatBox title={accounts?.length} subtitle={t("total")} />
        </Box>
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={
              accounts?.filter((x) => x.type === "depository").length
            }
            subtitle={t("depository")}
          />
        </Box>
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={
              accounts?.filter((x) => x.type === "investment").length
            }
            subtitle={t("investment")}
          />
        </Box>
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={accounts?.filter((x) => x.subtype === "credit card").length}
            subtitle={t("credit_cards")}
          />
        </Box>
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={accounts?.filter((x) => x.type === "loan").length}
            subtitle={t("loans")}
          />
        </Box>
      </Box>
    </Box>
  );
}

const MiniTransactionTable = () => {
  const { t } = useTranslation();
  const {
    status,
    data: transactions,
    error,
  } = useQuery({
    queryKey: ["transactions"],
    queryFn: getTransactions,
  });

  const columns = [
    { field: "account", headerName: t("account"), flex: 1 },
    { field: "name", headerName: t("name"), flex: 0.75 },
    { field: "amount", headerName: t("amount"), flex: 0.5 },
    { field: "date", headerName: t("date"), flex: 0.5 },
    { field: "transaction_type", headerName: t("type"), flex: 0.5 },
  ];

  if (status === "loading") {
    return <CircularProgressLoadingEffect />;
  }

  if (error) {
    // return <ErrorMessage errorMessage={error.message} />;
  }

  return (
    <div style={{ height: 320, width: "100%" }}>
      <DataGrid density="compact" rows={transactions} columns={columns} />
    </div>
  );
};

const MiniAccountsTable = () => {
  const { t } = useTranslation();
  const { status, data: accounts } = useQuery({
    queryKey: ["accounts"],
    queryFn: getAccounts,
  });

  const columns = [
    { field: "name", headerName: t("name"), flex: 1 },
    { field: "current", headerName: t("current"), flex: 0.4 },
    { field: "available", headerName: t("available"), flex: 0.4 },
  ];

  if (status === "loading") {
    return <CircularProgressLoadingEffect />;
  }

  return (
    <div style={{ height: 320, width: "100%" }}>
      <DataGrid density="compact" rows={accounts} columns={columns} />
    </div>
  );
};

const AccountTypePieChart = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { status, data: accounts } = useQuery({
    queryKey: ["accounts"],
    queryFn: getAccounts,
  });

  let data = [];

  if (accounts) {
    const groups = accounts.reduce((acc, account) => {
      if (!acc[account.type]) {
        const colorIndex = Object.keys(acc).length % colors.length;
        acc[account.type] = {
          id: account.type,
          label: account.type,
          value: 0,
          color: colors[colorIndex],
        };
      }
      acc[account.type].value += account.current;
      return acc;
    }, {});

    data = Object.values(groups);
  }

  if (status === "loading") {
    return <CircularProgressLoadingEffect />;
  }

  if (status === "error") {
    // handle error case
  }

  return (
    <ResponsivePie
      data={data}
      theme={{
        axis: {
          domain: {
            line: {
              stroke: colors.grey[100],
            },
          },
          legend: {
            text: {
              fill: colors.grey[100],
            },
          },
          ticks: {
            line: {
              stroke: colors.grey[100],
              strokeWidth: 1,
            },
            text: {
              fill: colors.grey[100],
            },
          },
        },
        legends: {
          text: {
            fill: colors.grey[100],
          },
        },
      }}
      margin={{ top: 40, bottom: 80 }}
      innerRadius={0.5}
      padAngle={0.7}
      cornerRadius={3}
      activeOuterRadiusOffset={8}
      borderColor={{
        from: "color",
        modifiers: [["darker", 0.2]],
      }}
      arcLinkLabelsSkipAngle={10}
      arcLinkLabelsTextColor={colors.grey[100]}
      arcLinkLabelsThickness={2}
      arcLinkLabelsColor={{ from: "color" }}
      enableArcLabels={false}
      arcLabelsRadiusOffset={0.4}
      arcLabelsSkipAngle={7}
      arcLabelsTextColor="#333333"
      defs={[
        {
          id: "dots",
          type: "patternDots",
          background: "inherit",
          color: "rgba(255, 255, 255, 0.3)",
          size: 4,
          padding: 1,
          stagger: true,
        },
        {
          id: "lines",
          type: "patternLines",
          background: "inherit",
          color: "rgba(255, 255, 255, 0.3)",
          rotation: -45,
          lineWidth: 6,
          spacing: 10,
        },
      ]}
      legends={[]}
    />
  );
};

const AccountSubtypePieChart = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { status, data: accounts } = useQuery({
    queryKey: ["accounts"],
    queryFn: getAccounts,
  });

  let data = [];

  if (accounts) {
    const groups = accounts.reduce((acc, account) => {
      if (!acc[account.subtype]) {
        const colorIndex = Object.keys(acc).length % colors.length;
        acc[account.subtype] = {
          id: account.subtype,
          label: account.subtype,
          value: 0,
          color: colors[colorIndex],
        };
      }
      acc[account.subtype].value += account.current;
      return acc;
    }, {});

    data = Object.values(groups);
  }

  if (status === "loading") {
    return <CircularProgressLoadingEffect />;
  }

  if (status === "error") {
    // handle error case
  }

  return (
    <ResponsivePie
      data={data}
      theme={{
        axis: {
          domain: {
            line: {
              stroke: colors.grey[100],
            },
          },
          legend: {
            text: {
              fill: colors.grey[100],
            },
          },
          ticks: {
            line: {
              stroke: colors.grey[100],
              strokeWidth: 1,
            },
            text: {
              fill: colors.grey[100],
            },
          },
        },
        legends: {
          text: {
            fill: colors.grey[100],
          },
        },
      }}
      margin={{ top: 40, bottom: 80 }}
      innerRadius={0.5}
      padAngle={0.7}
      cornerRadius={3}
      activeOuterRadiusOffset={8}
      borderColor={{
        from: "color",
        modifiers: [["darker", 0.2]],
      }}
      arcLinkLabelsSkipAngle={10}
      arcLinkLabelsTextColor={colors.grey[100]}
      arcLinkLabelsThickness={2}
      arcLinkLabelsColor={{ from: "color" }}
      enableArcLabels={false}
      arcLabelsRadiusOffset={0.4}
      arcLabelsSkipAngle={7}
      arcLabelsTextColor={{
        from: "color",
        modifiers: [["darker", 2]],
      }}
      defs={[
        {
          id: "dots",
          type: "patternDots",
          background: "inherit",
          color: "rgba(255, 255, 255, 0.3)",
          size: 4,
          padding: 1,
          stagger: true,
        },
        {
          id: "lines",
          type: "patternLines",
          background: "inherit",
          color: "rgba(255, 255, 255, 0.3)",
          rotation: -45,
          lineWidth: 6,
          spacing: 10,
        },
      ]}
      legends={[]}
    />
  );
};

const TransactionBarChart = ({ data }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { status, data: transactions = [] } = useQuery({
    queryKey: ["transactions"],
    queryFn: getTransactions,
  }) ?? {};

  const getCategoryData = (transactions) => {
    if (!transactions) return null;
  
    const categoryData = {};
    const currentYear = moment().year();
  
    const currentYearTransactions = transactions.filter(
      (transaction) =>
        moment(transaction?.date).year() === currentYear &&
        transaction.amount > 0
    );
  
    currentYearTransactions.forEach((transaction) => {
      const date = moment(transaction?.date);
      const month = date.format("MMM YYYY");
      const categoryId = transaction.category_id;
  
      if (!categoryData[month]) {
        categoryData[month] = {};
      }
  
      if (!categoryData[month][categoryId]) {
        categoryData[month][categoryId] = 0;
      }
  
      categoryData[month][categoryId] += transaction.amount;
    });
  
    const categoryTotals = {};
  
    // Calculate the total amount for each category
    Object.keys(categoryData).forEach((month) => {
      if (!categoryData[month]) { // initialize categoryData[month] to an empty object
        categoryData[month] = {};
      }
      Object.keys(categoryData[month]).forEach((categoryId) => {
        if (!categoryTotals[categoryId]) { // initialize categoryTotals[categoryId] to 0
          categoryTotals[categoryId] = 0;
        }
        categoryTotals[categoryId] += categoryData[month][categoryId];
      });
    });
  
    // Sort the categories by their total amount in descending order and keep only the top 5
    const topCategories = Object.keys(categoryTotals)
      .sort((a, b) => categoryTotals[b] - categoryTotals[a])
      .slice(0, 5);
  
    // Map the category data to the required format and keep only the top 5 categories
    const data = Object.entries(categoryData).map(([month, data]) => {
      const categoryData = Object.entries(data)
        .filter(([categoryId]) => topCategories.includes(categoryId))
        .reduce(
          (acc, [categoryId, amount]) => ({
            ...acc,
            [categoryId]: amount,
          }),
          {}
        );
  
      return {
        month,
        ...categoryData,
      };
    });
  
    return data;
  };

  let chartData = getCategoryData(transactions);

  if (!chartData) {
    return <CircularProgressLoadingEffect />;
  }

  if (status === "loading" || !transactions) {
    return <CircularProgressLoadingEffect />;
  }

  chartData.reverse();
  return (
    <ResponsiveBar
      data={chartData}
      keys={Object.keys(chartData?.[0] || {}).filter((key) => key !== "month")}
      theme={{
        // added
        axis: {
          domain: {
            line: {
              stroke: colors.grey[100],
            },
          },
          legend: {
            text: {
              fill: colors.grey[100],
            },
          },
          ticks: {
            line: {
              stroke: colors.grey[100],
              strokeWidth: 1,
            },
            text: {
              fill: colors.grey[100],
            },
          },
        },
        legends: {
          text: {
            fill: colors.grey[100],
          },
        },
      }}
      indexBy="month"
      margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
      padding={0.3}
      groupMode="stacked"
      colors={[
        "#FF5C5C",
        "#FFC870",
        "#4ECDC4",
        "#7E57C2",
        "#5C6BC0",
        "#26A69A",
      ]}
      enableGridX={true}
      enableGridY={true}
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "Month",
        legendPosition: "middle",
        legendOffset: 32,
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "Amount",
        legendPosition: "middle",
        legendOffset: -40,
      }}
      labelSkipWidth={12}
      labelSkipHeight={12}
      labelTextColor={{ from: "color", value: colors.textPrimary }}
      animate={true}
      motionStiffness={90}
      motionDamping={15}
    />
  );
};

const BalanceHistoryLineChart = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { t } = useTranslation();

  return (
    <Typography
      align="center"
      variant="h2"
      color={colors.grey[100]}
      fontWeight="bold"
      sx={{ m: "115px 0 0 0" }}
    >
      {t("coming_soon")}
    </Typography>
  );
};

const CryptoPortfolioLineChart = ({ isCustomLineColors = false, isDashboard = false }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const mockLineData = [
    {
      id: "XRP",
      color: "#F7931A",
      data: [
        { x: "Jan", y: 50000 },
        { x: "Feb", y: 52000 },
        { x: "Mar", y: 48000 },
        { x: "Apr", y: 51000 },
      ],
    },
    {
      id: "ETH",
      color: "#627EEA",
      data: [
        { x: "Jan", y: 2000 },
        { x: "Feb", y: 1800 },
        { x: "Mar", y: 1500 },
        { x: "Apr", y: 1900 },
      ],
    },
    {
      id: "XLM",
      color: "#CEA2AC",
      data: [
        { x: "Jan", y: 0.0032 },
        { x: "Feb", y: 0.0045 },
        { x: "Mar", y: 0.0019 },
        { x: "Apr", y: 0.0027 },
      ],
    },
  ];
  return (
    <ResponsiveLine
      data={mockLineData}
      theme={{
        axis: {
          domain: {
            line: {
              stroke: colors.grey[100],
            },
          },
          legend: {
            text: {
              fill: colors.grey[100],
            },
          },
          ticks: {
            line: {
              stroke: colors.grey[100],
              strokeWidth: 1,
            },
            text: {
              fill: colors.grey[100],
            },
          },
        },
        legends: {
          text: {
            fill: colors.grey[100],
          },
        },
        tooltip: {
          container: {
            color: colors.primary[500],
          },
        },
      }}
      colors={isDashboard ? { datum: "color" } : { scheme: "nivo" }} // added
      margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
      xScale={{ type: "point" }}
      yScale={{
        type: "linear",
        min: "auto",
        max: "auto",
        stacked: true,
        reverse: false,
      }}
      yFormat=" >-.2f"
      curve="catmullRom"
      axisTop={null}
      axisRight={null}
      axisBottom={{
        orient: "bottom",
        tickSize: 0,
        tickPadding: 5,
        tickRotation: 0,
        legend: isDashboard ? undefined : "transportation", // added
        legendOffset: 36,
        legendPosition: "middle",
      }}
      axisLeft={{
        orient: "left",
        tickValues: 5, // added
        tickSize: 3,
        tickPadding: 5,
        tickRotation: 0,
        legend: isDashboard ? undefined : "count", // added
        legendOffset: -40,
        legendPosition: "middle",
      }}
      enableGridX={false}
      enableGridY={false}
      pointSize={8}
      pointColor={{ theme: "background" }}
      pointBorderWidth={2}
      pointBorderColor={{ from: "serieColor" }}
      pointLabelYOffset={-12}
      useMesh={true}
      legends={[
        {
          anchor: "bottom-right",
          direction: "column",
          justify: false,
          translateX: 100,
          translateY: 0,
          itemsSpacing: 0,
          itemDirection: "left-to-right",
          itemWidth: 80,
          itemHeight: 20,
          itemOpacity: 0.75,
          symbolSize: 12,
          symbolShape: "circle",
          symbolBorderColor: "rgba(0, 0, 0, .5)",
          effects: [
            {
              on: "hover",
              style: {
                itemBackground: "rgba(0, 0, 0, .03)",
                itemOpacity: 1,
              },
            },
          ],
        },
      ]}
    />
  );
};

export {
  BalanceOverview,
  AccountOverview,
  MiniTransactionTable,
  MiniAccountsTable,
  TransactionBarChart,
  AccountTypePieChart,
  AccountSubtypePieChart,
  BalanceHistoryLineChart,
  PlaidLink,
  AccountsToTable,
  TransactionsToTable,
  WalletConnect,
  CryptoPortfolioLineChart,
  WalletsToTable
};
