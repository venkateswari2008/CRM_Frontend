export const environment = {
  production: false,
  // ng serve will proxy /api -> http://localhost:5171 (see proxy.conf.json),
  // so we can keep the same relative path in dev and prod.
  apiBaseUrl: '/api',
};
