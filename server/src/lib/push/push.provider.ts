// Push notification provider interface.
// Swap NullPushProvider for a real implementation (FCM, APNs, web-push)
// without changing any call site.

export interface PushPayload {
  title: string
  body:  string
  data?: Record<string, string>
}

export interface PushProvider {
  send(userId: string, payload: PushPayload): Promise<void>
}

/** No-op provider used when no push service is configured. */
export class NullPushProvider implements PushProvider {
  async send(_userId: string, _payload: PushPayload): Promise<void> {
    // intentionally empty
  }
}

export const pushProvider: PushProvider = new NullPushProvider()
