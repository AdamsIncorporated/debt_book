import React from 'react';
import { MenuItem, MenuItemProps } from 'react-pro-sidebar';

const ThemedMenuItem: React.FC<MenuItemProps> = ({ children, ...props }) => {
    return (
        <MenuItem
            {...props}
            rootStyles={{
                backgroundColor: '#0c4a6e', // Tailwind sky-900
                color: 'white',
                '--ps-menu-button-hover-bg': '#0369a1', // sky-700 hover
                '--ps-menu-button-active-bg': '#075985', // sky-800 active
            }}
        >
            {children}
        </MenuItem>
    );
};

export default ThemedMenuItem;
