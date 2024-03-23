import { listen, Event } from "@tauri-apps/api/event";

export const registerListenLcuEvent = (
  onLcuEvent: (
    event: Event<{
      subscription_type: string;
      data: Record<string, unknown>;
      event_type: string;
    }>
  ) => void
) => listen("lcu_event", onLcuEvent);
