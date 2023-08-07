import { Routes, Route,  } from "react-router-dom"; //useLocation
import Dashboard from "./pages/Home";
import Accounts from "./pages/Accounts";
import Transactions from "./pages/Transactions";
import LoginPage from "./pages/base/Login";
import TermsOfService from "./pages/base/ToS";
import AddAccount from "./pages/AddAccount";
import {LandingPage} from "./pages/base/LandingPage";
import SignUp from "./pages/base/SignUp"
import VerificationPage from "./pages/base/VerifyEmailView"
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import PrivateRoutes from "./utils/PrivateRoute";
import { AuthProvider } from "./context/AuthContext";
import ResetPassword from "./pages/base/ResetPassword"
import Crypto from "./pages/Crypto"
import SettingsPage from "./pages/Manage"
import Help from "./pages/Help"
import ContactForm from "./pages/base/Contact"
import { Analytics } from 'aws-amplify';
import awsconfig from './aws-exports';

Analytics.configure(awsconfig);


Analytics.autoTrack('session', {
	enable: true,
	immediate: true
});

Analytics.autoTrack('pageView', {
  enable: true,
  type: 'SPA',
  immediate: true
});

Analytics.autoTrack('event', {
  enable: true,
  immediate: true
});


function App() {
  const [theme, colorMode] = useMode();
    return (
    
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
          <div className="app">
            <main className="content">
            <AuthProvider>
              {/* Routes */}
              <Routes>
                  <Route path="/" element={<LandingPage />} exact/> 
                  <Route path="/login" element={<LoginPage />} exact/>
                  <Route path="/signUp" element={<SignUp />} exact/>
                  <Route path="/email-verify/:token" element={<VerificationPage />} />
                  <Route path="/ToS" element={<TermsOfService />} exact/>
                  <Route path="/contact" element={<ContactForm />} exact/>
                  <Route path="/verify-password-reset" element={<ResetPassword />} exact/>
                  
                  {/* Private Routes */}                  
                  <Route element={<PrivateRoutes />}>
                    <Route path="/home" element={<Dashboard />} />
                    <Route path="/accounts" element = {<Accounts />} />
                    <Route path="/transactions" element = {<Transactions />} />
                    {/* <Route path="/bills" element = {<BillCalendar />} /> */}
                    <Route path="/newAccount" element = {<AddAccount />} />
                    <Route path="/crypto" element = {<Crypto/>} />
                    <Route path="/settings" element = {<SettingsPage />} />
                    <Route path="/help" element = {<Help />} />
                  </Route>

              </Routes>
            </AuthProvider>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
