import { Layout } from '@/components/Layout'
import { useStore } from '@/store/useStore'
import { Tools } from '@/pages/Tools'
import { ScanPage } from '@/pages/ScanPage'

export default function App() {
  const { currentPage } = useStore()

  return (
    <Layout>
      {currentPage === 'scan' ? <ScanPage /> : <Tools />}
    </Layout>
  )
}
