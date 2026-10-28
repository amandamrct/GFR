import { lazy } from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import { useTheme } from "./hooks/useTheme.js";

// Cada tela é carregada só quando aberta.
const Overview = lazy(() => import("./pages/Overview.jsx"));
const Lives = lazy(() => import("./pages/Lives.jsx"));
const LiveDetail = lazy(() => import("./pages/LiveDetail.jsx"));
const Games = lazy(() => import("./pages/Games.jsx"));
const BestTimes = lazy(() => import("./pages/BestTimes.jsx"));
const Community = lazy(() => import("./pages/Community.jsx"));
const Goals = lazy(() => import("./pages/Goals.jsx"));
const StreamScreens = lazy(() => import("./pages/StreamScreens.jsx"));
const Settings = lazy(() => import("./pages/Settings.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

export default function App() {
  const [theme, setTheme] = useTheme();
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Overview />} />
        <Route path="lives" element={<Lives />} />
        <Route path="lives/:id" element={<LiveDetail />} />
        <Route path="jogos" element={<Games />} />
        <Route path="horarios" element={<BestTimes />} />
        <Route path="comunidade" element={<Community />} />
        <Route path="metas" element={<Goals />} />
        <Route path="telas" element={<StreamScreens />} />
        <Route path="configuracoes" element={<Settings theme={theme} setTheme={setTheme} />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
