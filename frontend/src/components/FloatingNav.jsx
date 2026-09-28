import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: "◆", end: true },
  { to: "/log", label: "Log Entry", icon: "✎" },
  { to: "/analytics", label: "Analytics", icon: "▲" },
  { to: "/history", label: "History", icon: "≡" },
];

export default function FloatingNav() {
  const { logout } = useAuth();

  return (
    <nav className="rail">
      <div className="rail__logo">VITALS</div>
      <div className="rail__nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            title={item.label}
            className={({ isActive }) => `rail__btn${isActive ? " rail__btn--active" : ""}`}
          >
            {item.icon}
          </NavLink>
        ))}
      </div>
      <div className="rail__footer">
        <button className="rail__btn" title="Log out" onClick={logout}>
          ⏻
        </button>
      </div>
    </nav>
  );
}
