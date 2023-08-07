import { useState } from "react";
import { Select, FormControl, MenuItem } from "@mui/material";
import { useTranslation } from "react-i18next";
import i18next from "i18next"

const LanguageOption = (props) => {
  const { t } = useTranslation();
  const [language, setLanguage] = useState(i18next.language); // Update initial state value

  const handleChange = (event) => {
    i18next.changeLanguage(event.target.value);
    setLanguage(event.target.value);
  };

  return (
    <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
      <Select
        labelId="select-language-label"
        id="select-language"
        value={language}
        onChange={handleChange}
        sx={{ maxHeight: "33px" }}
      >
        <MenuItem value={"en"}>{t('english')}</MenuItem>
        <MenuItem value={"es-MX"}>{t('spanish')}</MenuItem>
      </Select>
    </FormControl>
  );
};

export default LanguageOption;
