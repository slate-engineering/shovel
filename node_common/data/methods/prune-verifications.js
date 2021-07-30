import { runQuery } from "~/node_common/data/utilities";

export default async () => {
  return await runQuery({
    label: "PRUNE_VERIFICATION",
    queryFn: async (DB) => {
      const currentTime = new Date();
      const cutoffTime = new Date(currentTime.getTime() - 15 * 60000);

      //NOTE(toast): removes verification sessions created before 15 min ago
      const query = await DB.from("verifications").whereBetween("createdAt", "<", cutoffTime).del();
      return query === 1;
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "PRUNE_VERIFICATION",
      };
    },
  });
};
