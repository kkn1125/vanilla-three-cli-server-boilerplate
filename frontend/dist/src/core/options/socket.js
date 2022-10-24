const {
  DEV,
  PROD,
  MODE,
  BASE_URL,
  VITE_HOST: HOST,
  VITE_PORT: PORT,
} = import.meta.env;

export default {
  host: HOST,
  port: PORT,
  mode: MODE,
  isDev: DEV,
  isProd: PROD,
  query: location.search || "",
};
