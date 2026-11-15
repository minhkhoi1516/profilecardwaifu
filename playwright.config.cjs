const {defineConfig}=require('@playwright/test');
module.exports=defineConfig({
 testDir:'./tests/browser',timeout:60000,expect:{timeout:8000},workers:1,retries:0,
 reporter:[['list'],['json',{outputFile:'test-results/results.json'}]],
 use:{baseURL:process.env.BASE_URL||'http://127.0.0.1:8080',colorScheme:'dark',deviceScaleFactor:1,trace:'retain-on-failure',screenshot:'only-on-failure',
  launchOptions:process.env.QA_CHANNEL?{channel:process.env.QA_CHANNEL}:{},
 },
 webServer:process.env.BASE_URL?undefined:{command:'node scripts/qa/server.cjs',url:'http://127.0.0.1:8080',reuseExistingServer:!process.env.CI},
});
