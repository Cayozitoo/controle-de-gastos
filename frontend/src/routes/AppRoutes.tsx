import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout        from "../components/Layout";
import PessoaPage    from "../pages/PessoaPage";
import CategoriaPage from "../pages/CategoriaPage";
import TransacaoPage from "../pages/TransacaoPage";
import RelatorioPage from "../pages/RelatorioPage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/"          element={<PessoaPage />}    />
          <Route path="/categoria" element={<CategoriaPage />} />
          <Route path="/transacao" element={<TransacaoPage />} />
          <Route path="/relatorio" element={<RelatorioPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
