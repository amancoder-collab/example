module.exports = {
  apps: [{
    name: 'test-production',
    script: 'dist/main.js',
    instances: '1',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: 'logs/pm2/error.log',
    out_file: 'logs/pm2/out.log',
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    // node_args: '--max_old_space_size=1536',
    // Health check endpoint
    exp_backoff_restart_delay: 100
  }],

  // // Optional: Deploy configuration
  // deploy: {
  //   production: {
  //     user: 'your-user',
  //     host: 'your-host',
  //     ref: 'origin/main',
  //     repo: 'your-repository-url',
  //     path: '/var/www/your-app',
  //     'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.prod.config.js --env production'
  //   }
  // }
};