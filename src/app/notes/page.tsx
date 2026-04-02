import { Suspense } from 'react'
import Notes from './Notes'

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Notes />
    </Suspense>
  )
}
