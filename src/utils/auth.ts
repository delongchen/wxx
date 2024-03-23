import { invoke } from "@tauri-apps/api/tauri";

export const getAuth = async (): Promise<
  { port: string; auth: string } | undefined
> => {
  try {
    return await invoke("get_client_info");
  } catch (e) {
    console.log(e);
  }
};
