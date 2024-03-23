import { invoke } from "@tauri-apps/api";
import { listen, Event } from "@tauri-apps/api/event";
import { SubcriptionType } from "../constant";

let initailLcuEvent = false;

export const registerListenLcuEvent = (
  onLcuEvent: (
    event: Event<{
      subscription_type: SubcriptionType;
      data: Record<string, unknown> | string | unknown;
      event_type: string;
    }>
  ) => void
) => {
  if (!initailLcuEvent) {
    invoke("start_listen_lcu_event");
  }
  return listen("lcu_event", onLcuEvent);
};
