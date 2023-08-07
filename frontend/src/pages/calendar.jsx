import tokens from "@mui/material/styles/createPalette";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { Box, useTheme } from "@mui/material";
import Header from "../components/base/Header";
import { useTranslation } from "react-i18next";
import Layout from "../components/base/Layout";

const BillCalendar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { t } = useTranslation();

  const bills = [
    { id: 1, title: "Electricity Bill", dayOfMonth: 15 },
    { id: 2, title: "Internet Bill", dayOfMonth: 25 },
    { id: 3, title: "Rent", dayOfMonth: 1 },
    { id: 4, title: "Water Bill", dayOfMonth: 10 },
  ];

  const handleDateClick = (arg) => {
    console.log(arg.date);
    // handle date selection here
  };
  return (
    <Layout>
      <Box m="20px">
        <Header title={t('bills')} />

        <Box display="flex" justifyContent="space-between">
          {/* CALENDAR SIDEBAR */}
          <Box
            flex="1 1 20%"
            backgroundColor={colors.primary[400]}
            p="15px"
            borderRadius="4px"
          >

          </Box>

          {/* CALENDAR */}
          <Box flex="1 1 100%" ml="15px">
            <FullCalendar
              plugins={[dayGridPlugin]}
              initialView="dayGridMonth"
              editable={false}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={true}
              select={handleDateClick}
              events={bills.map((bill) => ({
                title: bill.title,
                start: `2023-04-${bill.dayOfMonth}`, // or use any other year/month
                allDay: true,
              }))}
            />
          </Box>
        </Box>
      </Box>
    </Layout>
  );
};

export { BillCalendar };
