import { CircularProgress } from "react-cssfx-loading";
import { Box } from '@mui/material';
import 'react-spinner-animated/dist/index.css'


const CircularProgressLoadingEffect = () => { 
      return (
        <Box display="flex" justifyContent="center" sx={{ marginTop:10 }}>
        <CircularProgress  color="#00df9a" width="100px" height="100px" duration="3s" />
        </Box>
      )
  }

export { CircularProgressLoadingEffect }