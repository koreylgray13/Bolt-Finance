import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { disableReactDevTools } from "@fvilers/disable-react-devtools";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import "./i18n.js";
import { Analytics } from 'aws-amplify';


if (process.env.NODE_ENV === "production") {
  disableReactDevTools();
  console.log = function () {};
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      cacheTime: 60000, // 60 seconds
      refetchInterval: 60000, // 60 seconds
      refetchIntervalInBackground: false,
      suspense: false,
      staleTime: 86400000, // 24 hours in milliseconds
    },
    mutations: {
      retry: 3,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Suspense fallback="...loading">
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <App />
          <ReactQueryDevtools />
        </QueryClientProvider>
      </BrowserRouter>
    </Suspense>
  </React.StrictMode>
);

Analytics.autoTrack('session', {
  enable: true,
  attributes: {
      attr: 'attr'
  },
});

Analytics.autoTrack('pageView', {
  // REQUIRED, turn on/off the auto tracking
  enable: true,
  eventName: 'pageView',
  // OPTIONAL, by default is 'multiPageApp'
  // you need to change it to 'SPA' if your app is a single-page app like React
  type: 'SPA',
  getUrl: () => {
      return window.location.origin + window.location.pathname;
  }
});

export default queryClient;