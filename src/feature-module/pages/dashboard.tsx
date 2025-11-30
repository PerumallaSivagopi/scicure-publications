import React, { useState } from 'react'
import { fetchAddressTypes } from '../../core/services/addressService'
const DashboardPage = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetchAddressTypes()
      setData(res)
    } catch (e) {
      setError(e?.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 sm:p-6">
  {/* Welcome Header */}
  <h2 className="text-xl sm:text-2xl font-semibold mb-6">
    Welcome Back <span className="italic text-primary">Admin</span>
  </h2>
</div>

    
  )
}

export default DashboardPage