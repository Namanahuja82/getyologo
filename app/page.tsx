import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'

function page() {
  return (
    <div>
      <h1>Get a logo for your business </h1>
    


      <Button><Link href="/sign-up">Generate a logo</Link></Button>

      
    </div>
  )
}

export default page