const hostRules = [
  {
    matchHost: "docker.io",
    concurrentRequestLimit: 2,
  },
];

// Only add authenticated Docker Hub rules when credentials are provided,
// otherwise Renovate emits "should be a string" config warnings.
if (process.env.DOCKERHUB_USERNAME && process.env.DOCKERHUB_TOKEN) {
  for (const matchHost of ["index.docker.io", "hub.docker.com"]) {
    hostRules.unshift({
      hostType: "docker",
      matchHost,
      username: process.env.DOCKERHUB_USERNAME,
      password: process.env.DOCKERHUB_TOKEN,
    });
  }
}

export default {
  allowedCommands: [],
  ...(process.env.RENOVATE_REDIS_URL ? { redisUrl: process.env.RENOVATE_REDIS_URL } : {}),
  hostRules,
};
