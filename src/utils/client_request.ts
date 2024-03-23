import { invoke } from "@tauri-apps/api/tauri";

export namespace Client {
  export const get = <T extends unknown>(
    endpoint: string
  ): Promise<T | undefined> => {
    return invoke("handle_get_request", {
      endpoint: endpoint,
    });
  };

  export const post = <T extends unknown>(
    endpoint: string,
    body: Record<string, unknown>
  ): Promise<T | undefined> => {
    return invoke("handle_post_request", {
      endpoint: endpoint,
      body
    });
  };
}
