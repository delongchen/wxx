import { invoke } from "@tauri-apps/api/tauri";
import qs from "qs";

export namespace Client {
  export const get = <T extends unknown>(
    endpoint: string,
    params?: Record<string, unknown>
  ): Promise<T | undefined> => {
    const url = params
      ? `${endpoint}?${qs.stringify(params)}`
      : endpoint;

    console.log("fetch", url);
    return invoke("handle_get_request", {
      endpoint: url,
    });
  };

  export const post = <T extends unknown>(
    endpoint: string,
    body: Record<string, unknown>
  ): Promise<T | undefined> => {
    return invoke("handle_post_request", {
      endpoint: endpoint,
      body,
    });
  };
}
