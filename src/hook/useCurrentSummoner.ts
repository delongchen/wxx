import { useQuery } from "@tanstack/react-query";
import { getCurrentSummoner } from "../api/lcu.ts";

export const useCurrentSummoner = () => {
  return useQuery({
    queryKey: ["getCurrentSummoner"],
    queryFn: getCurrentSummoner,
  });
};
