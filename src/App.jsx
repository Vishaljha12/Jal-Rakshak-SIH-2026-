import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import FloodMap from './pages/FloodMap';
import ImpactAnalysis from './pages/ImpactAnalysis';
import Validation from './pages/Validation';
import Scenarios from './pages/Scenarios';
import DataSources from './pages/DataSources';
import Settings from './pages/Settings';
import DualSPHysicsView from './pages/DualSPHysicsView';
import Delft3DView from './pages/Delft3DView';
import SolverComparison from './pages/SolverComparison';
import AdminPanel from './pages/AdminPanel';
import Simulation from './pages/Simulation';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/simulation" element={<Simulation />} />
          <Route path="/dualsphysics" element={<DualSPHysicsView />} />
          <Route path="/delft3d" element={<Delft3DView />} />
          <Route path="/solver-comparison" element={<SolverComparison />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/flood-map" element={<FloodMap />} />
          <Route path="/impact-analysis" element={<ImpactAnalysis />} />
          <Route path="/validation" element={<Validation />} />
          <Route path="/scenarios" element={<Scenarios />} />
          <Route path="/data-sources" element={<DataSources />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
