import { Link } from "react-router-dom";
import { Empty } from "../components/Ui.jsx";

export default function NotFound() {
  return (
    <div className="card">
      <Empty title="Página não encontrada">
        Este endereço não existe. <Link to="/">Voltar para a visão geral</Link>
      </Empty>
    </div>
  );
}
