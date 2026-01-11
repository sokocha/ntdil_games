import Outlier from '@/components/Outliers'

export const metadata = {
  title: 'Outliers | NTDIL Games',
  description: 'Find the word that does not belong in the group',
}

export default function OutliersPage() {
  return (
    <main className="min-h-screen py-4">
      <Outlier />
    </main>
  )
}
