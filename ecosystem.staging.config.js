module.exports = {
  apps: [
    {
      name: process.env.PM2_APP_NAME || 'test-development',
      script: 'dist/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: 'logs/pm2/error.log',
      out_file: 'logs/pm2/out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      exp_backoff_restart_delay: 100,
    },
  ],
};
