'use client'
import Enrollment from '@/app/components/Students/Enrollment/Enrollment'
import { useParams } from 'next/navigation'
import React from 'react'

const page = () => {
  const params = useParams()
const id = Array.isArray(params.id) ? params.id[0] : params.id;
console.log(params)
return (
  <div>
      <Enrollment params={{ id }}/>
  </div>
)
}

export default page