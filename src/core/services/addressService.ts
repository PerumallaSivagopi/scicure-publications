import { apiClient } from './apiClient'

export const fetchAddressTypes = () => apiClient.get('/api/MasterData/AddressTypes', undefined, {})
