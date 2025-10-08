import React, { useState } from 'react';
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';

const CustomSideBar: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="h-screen flex bg-sky-800 text-white">
            {/* Sidebar */}
            <Sidebar
                collapsed={collapsed}
                className="h-screen bg-sky-800 text-white"
            >
                <Menu className="bg-sky-800 text-white">
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

            {/* Main content */}
            <div className="flex-1 p-4">
                <h1 className="text-2xl font-bold text-white">Dashboard Content</h1>
            </div>
        </div>
    );
};

export default CustomSideBar;
