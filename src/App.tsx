import { Routes, Route } from 'react-router-dom';
import Specimen from './routes/Specimen';

/**
 * Route shell. Pages land here in tasks 5–9; for now the single Specimen
 * route proves the foundation — tokens, faces, glass levels and content —
 * renders and compiles.
 */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Specimen />} />
      <Route path="/_specimen" element={<Specimen />} />
    </Routes>
  );
}
