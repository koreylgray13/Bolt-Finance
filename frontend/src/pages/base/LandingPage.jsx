import Laptop from "../../assets/laptop.jpg";
import Footer from "../../components/base/Footer";
import { useNavigate } from "react-router-dom";
import { Typography, Box, Button } from "@mui/material";
import Languageoption from "../../components/base/LanguageOption";
import {useTranslation} from 'react-i18next'
import i18next from "i18next"
import Typewriter from "typewriter-effect";
import { Analytics } from 'aws-amplify';
import awsconfig from '../../aws-exports';

Analytics.configure(awsconfig);

const Header = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  
  const handleClick=(e)=>{
      i18next.changeLanguage(e.target.value)
      Analytics.record({ name: 'language-select', immediate: true });
  }

  return (
    <div className="flex justify-between items-center h-30 max-w-[2000px] mx-auto px-2 text-white">
        <h1 className='w-full text-3xl font-bold text-[#00df9a]'>Bolt Finance</h1> 
      <Box display="flex">
        <div>
          <Languageoption onChange={(e)=> handleClick(e)}/>
        </div>
        <div>
          <Button
            variant="outlined"
            size="medium"
            color="success"
            onClick={() => navigate("/login")}
            sx={{ mt: 1, marginRight: 1 }}
          >
            {t('login')}
          </Button>
        </div>
        <div>
          <Button
            variant="contained"
            size="medium"
            color="success"
            onClick={() => navigate("/signUp")}
            sx={{ mt: 1, marginRight: 0.5 }}
          >
            {t('sign_up')}
          </Button>
        </div>
      </Box>
    </div>
  );
};

const Hero = () => {
    const navigate = useNavigate();
  const {t} = useTranslation();
  return (
    <div className="text-white">
      <div className="max-w-[900px] mt-[-36px] w-full h-screen mx-auto text-center flex flex-col justify-center">
        <p className="text-[#00df9a] font-bold p-2">
        {t('landing_page_header_1')}
        </p>
        <h1 className="md:text-7xl sm:text-6xl text-4xl font-bold md:py-6">
          {t('landing_page_header_2')}
        </h1>
        <div className="flex justify-center items-center">
          <p className="md:text-5xl sm:text-4xl text-xl font-bold py-4">
            <Typewriter
              options={{
                strings: [t('landing_page_type_fx1'), t('landing_page_type_fx2'), t('landing_page_type_fx3')],
                autoStart: true,
                loop: true,
              }}
            />
          </p>
        </div>
        <p className="md:text-2xl text-xl font-bold text-gray-500">
        {t('landing_page_header_4')}

        </p>
        <div>
          <Button
            variant="outlined"
            size="large"
            color="success"
            sx={{ mt: 3 }}
            onClick={() => navigate("/signUp")}
          >
            {t('get_started')}
          </Button>
        </div>
      </div>
    </div>
  );
};

const AnalyticsSection = () => {
    const navigate = useNavigate();
  const {t} = useTranslation();
  return (
    <div className="w-full bg-white py-16 px-4">
      <div className="max-w-[1240px] mx-auto grid md:grid-cols-2">
        <img className="w-[500px] mx-auto my-4" src={Laptop} alt="/" />
        <div className="flex flex-col justify-center">
          <p className="text-[#00df9a] font-bold ">{t('landing_page_header_5')}</p>
          <Typography variant="h1" color="#000000" mt={1}>
          {t('landing_page_header_6')}
          </Typography>
          <Typography variant="h5" color="#000000" mt={2}>
          {t('landing_page_header_7')}
          </Typography>
          <button className="bg-black text-[#00df9a] w-[200px] rounded-md font-medium my-6 mx-auto md:mx-0 py-3"  onClick={() => navigate("/signUp")}>
          {t('get_started')}
          </button>
        </div>
      </div>
    </div>
  );
};

const LandingPage = () => {
  return (
    <div>
      <Header />
      <Hero />
      <AnalyticsSection />
      <Footer />
    </div>
  );
};

export { LandingPage, Header };
