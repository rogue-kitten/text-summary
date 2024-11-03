export const CHANNELS = ['SUMMARY', 'PROGRESS'] as const;

export type ChannelType = (typeof CHANNELS)[number];

export const ALL_CHANNELS = CHANNELS.reduce(
  (acc, permission) => {
    acc[permission] = permission;
    return acc;
  },
  {} as Record<ChannelType, ChannelType>,
);

export const validateChannel = (channel: string) => {
  return CHANNELS.includes(channel as unknown as ChannelType);
};
