module.exports = {
  apps: [
    {
      script: "app.js",
      watch: ".",
      node_args: "-r esm",
      instances: 1,
      increment_var: "PORT",
      wait_ready: true,
      env: {
        NODE_ENV: "development",
        HOST: "localhost",
        PORT: 3000,
      },
      env_development: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],

  deploy: {
    production: {
      user: "SSH_USERNAME",
      host: "SSH_HOSTMACHINE",
      ref: "origin/master",
      repo: "GIT_REPOSITORY",
      path: "DESTINATION_PATH",
      "pre-deploy-local": "",
      "post-deploy":
        "npm install && pm2 reload ecosystem.config.js --env production",
      "pre-setup": "",
    },
  },
};
