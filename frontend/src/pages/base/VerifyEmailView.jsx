import {useEffect} from 'react'
import {config} from "../../utils/Constants";
import { useParams } from 'react-router-dom';
import axios from 'axios';
import swal from "sweetalert";
import { useTranslation } from 'react-i18next';

let baseURL = config.url.API_URL

const VerificationPage = () => {
   const {t} = useTranslation()
  const { token } = useParams();
  useEffect(() => {
    const handleVerification = async () => {
      try {
        const response = await axios.post(`${baseURL}/auth/validate-email/${token}/`);
        if (response.status === 200) {
        swal({
          title: t('success'),
          text: t('email_verified'),
          icon: "success",
          button: "OK"
        }).then(() => {
          window.close();
        });
        }
      } catch (error) {
        console.log(error);
        swal({
          title: t('error'),
          text: t('error_creating_account'),
          icon: "error",
          button: "OK"
        }).then(() => {
          window.close();
        });

      }
    };

    handleVerification();
  }, [token, t]);

};

export default VerificationPage;