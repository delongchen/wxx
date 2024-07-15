import { invoke } from '@tauri-apps/api/core';
import { Event, listen } from '@tauri-apps/api/event';
import qs from 'qs';

export enum LcuEventType {
  LcuStateChange = 'LCU_STATE_CHANGE',
  LcuWsJsonApi = 'LCU_WS_JSON_API',
  Log = 'Log',
}

type Payload<T> = {
  key: string;
  data: T;
};

type PayloadDataType = {
  [LcuEventType.LcuStateChange]: {
    is_started: boolean;
  };
  // TODO: check lcu ws json api schema
  [LcuEventType.LcuWsJsonApi]: Record<string, unknown>;
  [LcuEventType.Log]: {
    type: 'error' | 'info' | 'warning';
    msg: string;
  };
};

export class WxxCore {
  static rest_client_get = <T>(
    endpoint: string,
    params?: Record<string, unknown>
  ): Promise<T | undefined> => {
    const url = params ? `${endpoint}?${qs.stringify(params)}` : endpoint;
    return invoke('plugin:wxx-core|handle_get_request', {
      endpoint: url,
    });
  };

  static rest_client_post = <T>(
    endpoint: string,
    body: Record<string, unknown>
  ): Promise<T | undefined> => {
    return invoke('plugin:wxx-core|handle_post_request', {
      endpoint: endpoint,
      body,
    });
  };

  static listen = <T extends LcuEventType>(
    eventName: T,
    listener: (event: Event<Payload<PayloadDataType[T]>>) => void
  ) => {
    return listen(eventName, listener);
  };
}
