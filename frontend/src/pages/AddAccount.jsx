import { Box } from "@mui/material";
import { PlaidLink } from "../data/BoltV2";
import Layout from "../components/base/Layout";
import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import { MenuItem  } from "@mui/material";
import Typography from "@mui/material/Typography";
import { useForm } from "react-hook-form";
import Grid from "@mui/material/Grid";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import CssBaseline from "@mui/material/CssBaseline";
import Container from "@mui/material/Container";
import { useNavigate } from "react-router-dom";
import useAxios from "../utils/useAxios";
import swal from 'sweetalert';
import { useTranslation } from "react-i18next";


const AddAccount = () => {
  const navigate = useNavigate();
  let api = useAxios();
  const [subtype, setSubtype] = React.useState("");
  const [type, setType] = React.useState("");
  const [typeSelected, setTypeSelected] = React.useState(false);
  const {t} = useTranslation()
  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Account Name Required"),
    current: Yup.string(),
    available: Yup.string(),
    limit: Yup.string(),

  });
  let newAccount = async (e) => {
    let response = await api.post("/api/plaid/account/new/", {
      name: e.name,
      account_type: type,
      subtype: subtype,
      current: e.current,
      available: e.available,
      limit: e.limit,
      official_name: e.name,
    });
    if (response.status === 200) {
      swal(t('success'), t('account_creation_successful'), "success");
      navigate("/accounts");
    } else {
    }
  };

  const onSubmit = (data) => {
    newAccount(data);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  const handleSubtype = (event) => {
    setSubtype(event.target.value);
  };

    const handleType = (event) => {
      setType(event.target.value);
      setTypeSelected(true);
    };


  const optionsByType = {
        "depository": [
        { value: "checking", label: "checking" },
        { value: "savings", label: "savings" },
        ],
        "credit": [
        { value: "credit card", label: "credit card" },
        { value: "auto", label: "auto" },
        { value: "business", label: "business" },
        { value: "line of credit", label: "line of credit" },
        { value: "401k", label: "401k" },
        { value: "other", label: "other" },
        ],
        "investment": [
        { value: "crypto exchange", label: "Crypto Exchange" },
        { value: "401k", label: "401k" },
        { value: "other", label: "other" },
        ],
        "loan": [
        { value: "auto", label: "auto" },
        { value: "business", label: "business" },
        { value: "line of credit", label: "line of credit" },
        { value: "other", label: "other" },
        ],
        "other": [
        { value: "other", label: "other" },
        ],
        };

  return (
    <Layout>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography
            component="h1"
            variant="h2"
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {t('manually_add_account')}
          </Typography>

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Grid container>
              <Grid item xs={12}>
                <TextField
                  sx={{
                    width: 600,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                  margin="normal"
                  fullWidth
                  id="name"
                  label={t('account_name')}
                  name="name"
                  autoComplete="name"
                  autoFocus
                  {...register("name")}
                  error={errors.name ? true : false}
                />
                <Typography variant="inherit" color="textSecondary">
                  {errors.name?.message}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  sx={{
                    marginTop: 2,
                    width: 600,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                  margin="normal"
                  fullWidth
                  name="current"
                  label={t('current')}
                  id="current"
                  type="number"
                  {...register("current")}
                  error={errors.current ? true : false}
                />
                <Typography variant="inherit" color="textSecondary">
                  {errors.current?.message}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  sx={{
                    marginTop: 2,
                    width: 600,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                  margin="normal"
                  fullWidth
                  name="available"
                  label={t('available')}
                  id="available"
                  type="number"
                  {...register("available")}
                  error={errors.available ? true : false}
                />

                <Typography variant="inherit" color="textSecondary">
                  {errors.available?.message}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  sx={{
                    marginTop: 2,
                    width: 600,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                  fullWidth
                  name="limit"
                  label={t('limit')}
                  id="limit"
                  type="number"
                  {...register("limit")}
                  error={errors.limit ? true : false}
                />
                <Typography variant="inherit" color="textSecondary">
                  {errors.limit?.message}
                </Typography>
              </Grid>

<Grid item xs={12}>
  <Select
    sx={{
      marginTop: 2,
      width: 600,
      display: "flex",
      alignItems: "center",
    }}
    id="type-select"
    name="type"
    label="Type"
    value={type}
    onChange={handleType}
    color="primary"
  >
    {Object.keys(optionsByType).map((typeOption) => (
      <MenuItem key={typeOption} value={typeOption}>
        {typeOption}
      </MenuItem>
    ))}
  </Select>
</Grid>
<Grid item xs={12}>
  <Select
    sx={{
      marginTop: 2,
      width: 600,
      display: "flex",
      alignItems: "center",
    }}
    name="subtype"
    label="Subtype"
    value={subtype}
    onChange={handleSubtype}
    color="primary"
    disabled={!typeSelected}
  >
    {optionsByType[type]?.map((subtypeOption) => (
      <MenuItem key={subtypeOption.value} value={subtypeOption.value}>
        {subtypeOption.label}
      </MenuItem>
    ))}
  </Select>
</Grid>





              <Grid item xs={12}></Grid>
            </Grid>
            <Button
              disabled
              color="success"
              type="submit"
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              {t('add')}
            </Button>
          </Box>

          <Box>
            <Typography
              component="h1"
              variant="h2"
              sx={{
                marginTop: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                fontWeight: "bold",
              }}
            >
              {t('or')}
            </Typography>

            <Typography
              component="h1"
              variant="h2"
              sx={{
                marginTop: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {t('connect_via_plaid')}
              <PlaidLink />
            </Typography>
          </Box>
        </Box>
      </Container>
    </Layout>
  );
};

export default AddAccount;
