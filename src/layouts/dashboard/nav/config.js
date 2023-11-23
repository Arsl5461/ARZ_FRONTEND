// component
import SvgColor from "../../../components/svg-color";

// ----------------------------------------------------------------------

const icon = (name) => (
  <SvgColor
    src={`/assets/icons/navbar/${name}.svg`}
    sx={{ width: 1, height: 1, color: "#fff" }}
  />
);

/**
 * Implement permissions for nav
 *
 * Author: Ali Haider
 * Date: 15 Sep, 2023
 */
const navConfig = [
  {
    title: "Dashboard",
    path: "/dashboard/app",
    icon: icon("ic_analytics"),
    name: "View-Dashboard",
  },
  {
    title: "Users Management",
    icon: icon("users-management"),
    name: "View-Users-Management",
    submenu: [
      {
        title: "Users",
        path: "/dashboard/users",
        icon: icon("ic_user"),
        name: "View-Users",
      },
      {
        title: "Roles",
        path: "/dashboard/roles",
        icon: icon("roles-permission"),
        name: "View-Role",
      },
    ],
  },
  {
    title: "Email Templates",
    path: "/dashboard/email-templates",
    icon: icon("email"),
    name: "View-Email-Template",
  },
  {
    title: "Log History",
    path: "/dashboard/logs",
    icon: icon("list"),
    name: "View-Notification",
  },
  {
    title: "Integration",
    path: "/dashboard/integration",
    icon: icon("integration"),
    name: "View-Integration",
  },
  {
    title: "subscription packages",
    path: "/dashboard/packages",
    icon: icon("integration"),
    name: "View-Integration",
  },
  {
    title: "Questions",
    path: "/dashboard/questions",
    icon: icon("integration"),
    name: "View-Integration",
  },
  {
    title: "Setting",
    path: "/dashboard/setting",
    icon: icon("settings"),
    name: "Create-Settings",
  },
];

export default navConfig;
