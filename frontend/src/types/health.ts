export type HealthResponse = {
  status: "ok";
  uptime: number;
  timestamp: string;
};

export type ReadinessResponse = {
  status: "ok" | "error";
  database: "up" | "down";
  timestamp: string;
};
