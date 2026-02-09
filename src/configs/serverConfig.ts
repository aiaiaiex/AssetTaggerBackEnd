interface ServerConfig {
  port: number;
}

const serverConfig: ServerConfig = {
  port: Number(process.env.SERVER_PORT) || 3000,
};

export default serverConfig;
