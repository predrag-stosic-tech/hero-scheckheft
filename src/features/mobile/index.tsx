import { Navigate, Route, Routes } from 'react-router';
import MobileLayout from './MobileLayout';
import { Dokumente, Historie, Uebersicht } from './pages';

export default function MobileRoutes() {
  return (
    <Routes>
      <Route element={<MobileLayout />}>
        <Route index element={<Uebersicht />} />
        <Route path="historie" element={<Historie />} />
        <Route path="dokumente" element={<Dokumente />} />
        <Route path="*" element={<Navigate to="/m" replace />} />
      </Route>
    </Routes>
  );
}
