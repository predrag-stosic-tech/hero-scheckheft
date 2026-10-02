import { Route, Routes } from 'react-router';
import { NotInDemo } from '@/components/shell/NotInDemo';
import BetriebLayout from './BetriebLayout';
import Board from './Board';
import { EinreichungDetail, Einreichungen } from './Einreichungen';
import KundenScheckheft from './KundenScheckheft';
import Startseite from './Startseite';

export default function BetriebRoutes() {
  return (
    <Routes>
      <Route element={<BetriebLayout />}>
        <Route index element={<Startseite />} />
        <Route path="einreichungen" element={<Einreichungen />} />
        <Route path="einreichungen/:id" element={<EinreichungDetail />} />
        <Route path="board" element={<Board />} />
        <Route path="scheckheft" element={<KundenScheckheft />} />
        <Route path="*" element={<NotInDemo />} />
      </Route>
    </Routes>
  );
}
