import { invoke } from '@tauri-apps/api/core';
import { Event, listen } from '@tauri-apps/api/event';
import qs from 'qs';

export class LcuClient {
  static get = <T>(
    endpoint: string,
    params?: Record<string, unknown>
  ): Promise<T | undefined> => {
    const url = params ? `${endpoint}?${qs.stringify(params)}` : endpoint;
    return invoke('plugin:lcu-client|handle_get_request', {
      endpoint: url,
    });
  };

  static post = <T>(
    endpoint: string,
    body: Record<string, unknown>
  ): Promise<T | undefined> => {
    return invoke('plugin:lcu-client|handle_post_request', {
      endpoint: endpoint,
      body,
    });
  };

  static init = () => {
    invoke('plugin:lcu-client|connect_lcu_client');
    invoke('plugin:lcu-client|start_listen_lcu_event');
  };

  static listen = (
    listener: (
      event: Event<{
        subscription_type: SubcriptionType;
        data: Record<string, unknown> | string | unknown;
        event_type: string;
      }>
    ) => void
  ) => {
    return listen('lcu_event', listener);
  };
}

export enum SubcriptionType {
  GameFlow = 'OnJsonApiEvent_lol-gameflow_v1_gameflow-phase',
  LcuClient = 'lcu_client',
}
