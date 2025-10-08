import React, { useState } from 'react';
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';

const CustomSideBar: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);

    const sidebarBg = '#0369a1'; // Tailwind sky-800 hex
    const hoverSidebarBg = '#0c4a6e'; // Tailwind sky-700 hex

    return (
        <div className="h-screen flex bg-sky-800">
            <Sidebar
                collapsed={collapsed}
                rootStyles={{
                    backgroundColor: sidebarBg,
                    color: 'white',
                }}
            >
                <Menu
                    menuItemStyles={{
                        button: ({ level, active }) => ({
                            backgroundColor: sidebarBg,
                            color: 'white',
                            '&:hover': {
                                backgroundColor: hoverSidebarBg,
                            },
                        }),
                        // optional: icon and label text
                        icon: { color: 'white' },
                        label: { color: 'white' },
                    }}
                >
                    <MenuItem onClick={() => setCollapsed(!collapsed)}>
                        {collapsed ? '➡️' : '⬅️'} Toggle
                    </MenuItem>
                    <SubMenu label="Debt">
                        <MenuItem>Issuer</MenuItem>
                        <MenuItem>Issuance</MenuItem>
                        <MenuItem>Series</MenuItem>
                        <MenuItem>Maturity</MenuItem>
                        <MenuItem>Debt Service</MenuItem>
                    </SubMenu>
                </Menu>
            </Sidebar>

            <div className="flex-1 p-4 bg-sky-800 text-white">
                <h1 className="text-2xl font-bold">Dashboard Content</h1>
            </div>
        </div>
    );
};

export default CustomSideBar;
