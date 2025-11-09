export const uiConfig = {
  header: {
    title: 'INFERRA CLI v2',
    subtitle: 'INFERRA Local AI Server',
    description: 'INFERRA Local AI Assistant and Development Tools',
  },
  footer: {
    help: '[Enter: send] [Ctrl+C: exit] [Ctrl+K: clear]',
  },
  messages: {
    loading: 'Loading...',
    ready: 'Ready',
    error: 'Error occurred',
    sending: 'Sending...',
  },
  defaults: {
    spinnerType: 'dots' as const,
    scrollHeight: 10,
  },
};
