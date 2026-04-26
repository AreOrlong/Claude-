import { Layout } from './components/Layout';
import { useStore } from './store/useStore';
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { ToolDetail } from './pages/ToolDetail';
import { ScanPage } from './pages/ScanPage';
import { Categories } from './pages/Categories';
import { Locations } from './pages/Locations';

export default function App() {
  const { currentPage } = useStore();

  const page = (() => {
    switch (currentPage) {
      case 'dashboard':   return <Dashboard />;
      case 'inventory':   return <Inventory />;
      case 'tool-detail': return <ToolDetail />;
      case 'scan':        return <ScanPage />;
      case 'categories':  return <Categories />;
      case 'locations':   return <Locations />;
      default:            return <Dashboard />;
    }
  })();

  return <Layout>{page}</Layout>;
}
