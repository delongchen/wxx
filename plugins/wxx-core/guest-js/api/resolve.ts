const PLUGIN_NAME = "wxx-core" as const;

export const resolveCmdName = (cmd: string) => {
  return `plugin:${PLUGIN_NAME}|${cmd}`;
}
