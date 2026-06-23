import { NavLink, useNavigate } from "react-router-dom";
import {
  FiGrid,
  FiShoppingCart,
  FiBox,
  FiUsers,
  FiSettings,
} from "react-icons/fi";
import styles from "./Sidebar.module.css";
import { FileBarChart2Icon } from "lucide-react";
import { IoExitOutline } from "react-icons/io5";
import { useAuth } from "../../contexts/AuthContext";
import { useOrderCount } from "../../contexts/OrderCountContext";

export function Sidebar() {
  const { logout } = useAuth();
  const { totalOrders } = useOrderCount();
  const navigate = useNavigate();

  function handleLogout() {
    // 1️⃣ Limpa token e estado
    logout();

    // 2️⃣ Redireciona para login
    navigate("/login");
  }

  
  return (
    <aside className={styles.sidebar}>
      <div>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>🍔</div>
          <div>
            <strong className={styles.brandTitle}>BURGUER ADMIN</strong>
            <span className={styles.brandSubtitle}>Gestão de Unidade</span>
          </div>
        </div>

        <nav className={styles.menu}>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive ? styles.active : styles.link
            }
          >
            <FiGrid className={styles.icon} />
            <span>Painel</span>
          </NavLink>

          <NavLink
            to="/pedidos"
            className={({ isActive }) =>
              isActive ? styles.active : styles.link
            }
          >
            <FiShoppingCart className={styles.icon} />
            <span>Pedidos</span>
            <span className={styles.badge}>{totalOrders}</span>
          </NavLink>

          <NavLink
            to="/produtos"
            className={({ isActive }) =>
              isActive ? styles.active : styles.link
            }
          >
            <FiBox className={styles.icon} />
            <span>Produtos</span>
          </NavLink>

          <NavLink
            to="/clientes"
            className={({ isActive }) =>
              isActive ? styles.active : styles.link
            }
          >
            <FiUsers className={styles.icon} />
            <span>Clientes</span>
          </NavLink>

          <NavLink
            to="/relatorios"
            className={({ isActive }) =>
              isActive ? styles.active : styles.link
            }
          >
            <FileBarChart2Icon className={styles.icon} />
            <span>Relatórios</span>
          </NavLink>
        </nav>
      </div>
      <div className={styles.footer}>
        <NavLink
          to="/configuracoes"
          className={({ isActive }) => (isActive ? styles.active : styles.link)}
        >
          <FiSettings className={styles.icon} />
          <span>Configurações</span>
        </NavLink>

        <NavLink
          onClick={() => handleLogout()}
          to={""}
          className={({ isActive }) =>
            isActive ? styles.buttonExit : styles.linkButton
          }
        >
          <IoExitOutline className={styles.icon} color="red" />
          <span>Sair</span>
        </NavLink>

        <div className={styles.user}>
          <img
            src="https://i.pravatar.cc/40"
            alt="User"
            className={styles.avatar}
          />
          <div>
            <strong>Ricardo Silva</strong>
            <span>Gerente</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
