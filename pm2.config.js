module.exports = {
  apps: [{
    name: 'gone-web',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    // out_file: 'logs/out.log',
    // error_file: 'logs/error.log',
    max_memory_restart: '1G',
    env: {
      PORT: 3003
    },
    exec_mode: 'cluster',
    instances: '1',
    autorestart: true
  }]
}
