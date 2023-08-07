import axios from "axios";
import dayjs from "dayjs";
import jwt_decode from "jwt-decode";
import { config } from "../utils/Constants";
import RefreshIcon from "@mui/icons-material/Refresh";
import useAxios from "../utils/useAxios"
import swal from "sweetalert";
import { IconButton } from "@mui/material";

const baseURL = config.url.API_URL;
let authTokens = localStorage.getItem("authTokens")
  ? JSON.parse(localStorage.getItem("authTokens"))
  : null;

const axiosInstance = axios.create({
  baseURL,
  headers: { Authorization: `Bearer ${authTokens?.access}` }});

axiosInstance.interceptors.request.use(async (req) => {
  if (!authTokens) {
    authTokens = localStorage.getItem("authTokens")
      ? JSON.parse(localStorage.getItem("authTokens"))
      : null;
  }

  req.headers.Authorization = `Bearer ${authTokens?.access}`;

  const user = jwt_decode(authTokens.access);
  const isExpired = dayjs.unix(user.exp).diff(dayjs()) < 1;

  if (!isExpired) {
    return req;
  }

  const response = await axios.post(`${baseURL}/auth/login/refresh/`, {
    refresh: authTokens.refresh,
  });

  localStorage.setItem("authTokens", JSON.stringify(response.data));
  req.headers.Authorization = `Bearer ${response.data.access}`;

  return req;
});

const getAccounts = async () => {
  const response = await axiosInstance.get("/api/plaid/accounts/");
  const accounts = response?.data;
  return accounts;
};

const getAccountTotals = async () => {
  const response = await axiosInstance.get("/api/plaid/accounts/overview/");
  const accountTotals = response?.data;
  return accountTotals;
};


const getTransactions = async () => {
  const response = await axiosInstance.get("/api/plaid/transactions/");
  const transactions = response?.data;
  return transactions;
};


const UpdateAccounts = () => {
  let api = useAxios()
  let callAlert = async () => {
    await api
      .get("/api/plaid/accounts/update/")
      .then((response) => swal(response.data));
  };
  return (
    <IconButton onClick={() => callAlert()}>
      <RefreshIcon />
    </IconButton>
  );
};

const UpdateTransactions = () => {
  let api = useAxios()
  let callAlert = async () => {
    await api
      .get("/api/plaid/transactions/update/")
      .then((response) => swal(response.data));
  };

  return (
    <IconButton onClick={() => callAlert()}>
      <RefreshIcon />
    </IconButton>
  );
};

export {
  axiosInstance,
  getAccounts,
  getTransactions,
  getAccountTotals,
  UpdateAccounts,
  UpdateTransactions,
};