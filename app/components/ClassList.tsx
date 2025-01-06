'use client'

import { useEffect, useState } from 'react'
import fetchClasses from '../lib/api'


export default function ClassList() {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const response = await fetchClasses('/classes', { params: { limit: 10, page: 1 } })
        setClasses(response.data)
      } catch (error) {
        console.error('Failed to fetch classes:', error)
      } finally {
        setLoading(false)
      }
    }

    loadClasses()
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {classes.map((classItem: any) => (
          <li key={classItem.id}>
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-indigo-600 truncate">
                  {classItem.title}
                </h3>
                <div className="ml-2 flex-shrink-0 flex">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    classItem.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {classItem.status ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}