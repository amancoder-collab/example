module.exports = {
  apps: [
    {
      name: process.env.PM2_APP_NAME || 'test-development',
      script: 'dist/main.js',

      // Use all available CPUs for zero downtime reloads (or set a specific number)
      instances: 'max',
      exec_mode: 'cluster',

      // Automatically restart the app if it crashes
      autorestart: true,
      watch: false,

      // Memory limit per process to avoid runaway processes
      max_memory_restart: '1G',

      // Logging configuration
      error_file: 'logs/pm2/error.log',
      out_file: 'logs/pm2/out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',

      // Health check / readiness - use your app's endpoint if needed
      exp_backoff_restart_delay: 100,

      // Environment variables
      env: {
        NODE_ENV: 'development',
      },
    },
  ],
};
