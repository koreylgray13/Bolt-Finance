import { useContext } from "react";
import { useNavigate } from 'react-router-dom';
import { Box, IconButton, useTheme, Button } from "@mui/material";
import { ColorModeContext } from "../../theme";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import AuthContext from "../../context/AuthContext";
import * as React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Tooltip from '@mui/material/Tooltip';
import Settings from '@mui/icons-material/Settings';
import Logout from '@mui/icons-material/Logout';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import Languageoption from "../base/LanguageOption"
import {useTranslation} from 'react-i18next'
import swal from "sweetalert";
import HelpCenterIcon from '@mui/icons-material/HelpCenter';

function AccountMenu() {
  let { logoutUser } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();
  const {t} = useTranslation();
  
  const handleDonateClick = () => {
      window.location.href = 'https://checkout.stripe.com/c/pay/cs_live_a171y1eWdzGI3ntmGn163VewOULsJEmpCHYWOh8WFked9MDMOIn8k9gBOl#fidkdWxOYHwnPyd1blppbHNgWjA0SHQ0PUdNVjNRSmtvUl9zbm1XYXQxUDRGd2NvT2piVDEzQjJyTU1WUGg0dkdcZGgyQkRwVFYzZk4wUWgyMFBvS0pLN0tXS0F9aEdwPDJpTktNVmR8UGg9NTVVbGdWcExjPCcpJ3VpbGtuQH11anZgYUxhJz8nZks3PEFyNnZ%2FM1B0YVNONTU1J3gl';
  }

  const handleHelpClick = () => {
      navigate('/help')
  }

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    
    <React.Fragment>
      <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
        <Tooltip title="Account settings">
          <IconButton
            onClick={handleClick}
            size="small"
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            <PersonOutlinedIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem disabled onClick={()=> navigate('/settings')}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          {t('settings')}
        </MenuItem>



        <MenuItem onClick={()=> handleHelpClick()}>
          <ListItemIcon >
          <HelpCenterIcon />
          </ListItemIcon>
          {t('help')}
        </MenuItem>
        <MenuItem onClick={()=> handleDonateClick()}>
          <ListItemIcon >
          <VolunteerActivismIcon />
          </ListItemIcon>
          {t('donate')}
        </MenuItem>

        <MenuItem onClick={logoutUser}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          {t('logout')}
        </MenuItem>
      </Menu>
    </React.Fragment>
  );
};


const Topbar = () => {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const navigate = useNavigate()
  const {t} = useTranslation();

  const ComingSoon = () => {
    swal(t('coming_soon'));
  }
  return (
    <Box display="flex" justifyContent="space-between" p={ 1 }>

      <Box display="flex">
        <Box>
          <h1 className='w-full text-3xl font-bold text-[#00df9a]'>Bolt Finance</h1>
        </Box>
        <Box> 
          <Button size="large" color="secondary" onClick={() => navigate("/home")}  sx={{ mt: .5,  marginLeft: 1 }}>
            {t('dashboard')}
          </Button>
          <Button size="large" color="secondary" onClick={() => navigate("/accounts")}  sx={{ mt: .5,  marginLeft: 1 }}>
          {t('accounts')}
          </Button>
          <Button size="large" color="secondary" onClick={() => navigate("/transactions")}  sx={{ mt: .5,  marginLeft: 1 }}>
          {t('transactions')}
          </Button>
          <Button size="large" color="secondary" onClick={() => ComingSoon()}  sx={{ mt: .5,  marginLeft: 1 }}>
          {t('debt')}
          </Button>
          <Button size="large" color="secondary" onClick={() => ComingSoon()}  sx={{ mt: .5,  marginLeft: 1 }}>
          {t('crypto')}
          </Button>
          </Box>

      </Box>
      {/* ICONS */}
          <Box display="flex">
          <div>
          <Languageoption />
        </div>
        

        <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === "dark" ? (
            <DarkModeOutlinedIcon />
          ) : (
            <LightModeOutlinedIcon />
          )}
        </IconButton>

        <AccountMenu />

      </Box>
    </Box>
  );
};


const Layout = ({ children }) => {

  return (
    <>
      <div>
        <Topbar />
          <div>{children}</div>
      </div>
    </>
  );
};

export default Layout;