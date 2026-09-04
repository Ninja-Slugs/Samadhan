import { withRoute } from "@/server/http";

export const GET = withRoute(async () => {
  return {
    status: "ok",
    service: "samadhan-web",
    time: new Date().toISOString()
  };
});
