import React, { useState } from 'react'
import { fetchAddressTypes } from '../../core/services/addressService'

const StarterPage = () => {
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
    <div>
      <h2>Welcome Back <span style={{ fontStyle: 'italic' }}>Admin</span></h2>
      {/* <p>This is the Admin Dashboard</p> */}
    </div>
  )
}

export default StarterPage