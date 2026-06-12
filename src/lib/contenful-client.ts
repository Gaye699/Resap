import { createClient, type ClientAPI } from 'contentful-management'

let _client: ClientAPI | null = null

export function getManagementClient(): ClientAPI {
  if (!_client) {
    const token = process.env.CONTENTFUL_MANAGEMENT_API_ACCESS_TOKEN
    if (!token) throw new Error('CONTENTFUL_MANAGEMENT_API_ACCESS_TOKEN manquant')
    _client = createClient({ accessToken: token })
  }
  return _client
}
