import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Box, Drawer, List, ListItem, ListItemText, Collapse } from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import navConfig from './config';
import useResponsive from '../../../hooks/useResponsive';
import Scrollbar from '../../../components/scrollbar';
import { StyledNavItemIcon } from '../../../components/nav-section/styles';
import { checkPermission, isSuperAdmin } from '../../../utils/Permissions';

const NAV_WIDTH = 280;

const Nav = ({ openNav, onCloseNav }) => {
    const { pathname } = useLocation();
    const isDesktop = useResponsive('up', 'lg');
    const [openSubmenus, setOpenSubmenus] = useState({});

    const toggleSubmenu = (name) => {
        setOpenSubmenus((prevOpenSubmenus) => ({
            ...prevOpenSubmenus,
            [name]: !prevOpenSubmenus[name],
        }));
    };

   /**
   * Handle rendering of sidebar menus and submenus along with titles and icons based on permissions.
   *
   * @param {item} - The navigation item to render.
   * @return {JSX.Element} - The rendered navigation item.
   *
   * Author: Zain Ashraf
   * Date: 26 Oct, 2023
   */
    const renderNavItem = (item) => {
        const { icon } = item;
        const hasSubmenu = item.submenu && item.submenu.length > 0;
        const isActive = pathname === item.path;

        return (
            <>
                {item.title === 'Log History' && !isSuperAdmin('Super Admin') ? null : checkPermission(item?.name) ? (
                    <>
                        <ListItem
                            button
                            onClick={() => (hasSubmenu ? toggleSubmenu(item.title) : onCloseNav())}
                            component={hasSubmenu ? 'div' : Link}
                            to={item.path}
                            selected={pathname === item.path}
                            className={isActive ? 'active' : ''}
                        >
                            <StyledNavItemIcon>{icon && icon}</StyledNavItemIcon>
                            <ListItemText primary={item.title} />
                            {hasSubmenu ? openSubmenus[item.title] ? <ExpandLess /> : <ExpandMore /> : null}
                        </ListItem>
                        {hasSubmenu && (
                            <Collapse in={openSubmenus[item.title]} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    {item.submenu.map((subitem) =>
                                        checkPermission(subitem?.name) ? (
                                            <ListItem
                                                button
                                                key={subitem.title}
                                                component={Link}
                                                to={subitem.path}
                                                selected={pathname === subitem.path}
                                                className={pathname === subitem.path ? 'active' : ''}
                                            >
                                                <StyledNavItemIcon>{subitem.icon && subitem.icon}</StyledNavItemIcon>
                                                <ListItemText primary={subitem.title} />
                                            </ListItem>
                                        ) : null
                                    )}
                                </List>
                            </Collapse>
                        )}
                    </>
                ) : null}
            </>
        );
    };

    const renderContent = (
        <Scrollbar
            sx={{
                height: 1,
                '& .simplebar-content': { height: 1, display: 'flex', flexDirection: 'column' },
            }}
        >
            <Box sx={{ px: 2.5, py: 3, display: 'inline-flex' }}>
                <img src={`${process.env.PUBLIC_URL}/assets/icons/site-logo.png`} alt="Logo" />
            </Box>

            {navConfig.map((item) => renderNavItem(item))}

            <Box sx={{ flexGrow: 1 }} />
        </Scrollbar>
    );

    return (
        <Box
            component="nav"
            sx={{
                flexShrink: { lg: 0 },
                width: { lg: NAV_WIDTH },
            }}
        >
            {isDesktop ? (
                <Drawer
                    open
                    variant="permanent"
                    PaperProps={{
                        sx: {
                            width: NAV_WIDTH,
                            bgcolor: 'background.default',
                            borderRightStyle: 'dashed',
                        },
                    }}
                >
                    {renderContent}
                </Drawer>
            ) : (
                <Drawer
                    open={openNav}
                    onClose={onCloseNav}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    PaperProps={{
                        sx: { width: NAV_WIDTH },
                    }}
                >
                    {renderContent}
                </Drawer>
            )}
        </Box>
    );
};

export default Nav;
