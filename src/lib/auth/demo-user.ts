export type DemoUserCredentials = {
  name: string
  email: string
  password: string
}

export function createDemoUserCredentials(): DemoUserCredentials {
  const id = crypto.randomUUID().replaceAll('-', '').slice(0, 12)

  return {
    name: 'Demo User',
    email: `demo-${id}@example.com`,
    password: `demo-${id}`,
  }
}
