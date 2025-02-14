import { Routes, Route } from 'react-router-dom';
import SavedAnalyses from '../components/pages/Farmer/saved-analyses';
// ...existing imports...

const FarmerRoutes = () => {
  return (
    <Routes>
      {/* ...existing routes... */}
      <Route path="/trackplants" element={<TrackPlants />} />
      <Route path="/saved-analyses" element={<SavedAnalyses />} />
    </Routes>
  );
};

export default FarmerRoutes;
