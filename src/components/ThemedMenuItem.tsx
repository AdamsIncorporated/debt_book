import React from 'react';
import { MenuItem, MenuItemProps } from 'react-pro-sidebar';

const ThemedMenuItem: React.FC<MenuItemProps> = ({ children, ...props }) => {
    return (
        <MenuItem
            {...props}
            rootStyles={{
                backgroundColor: '#0c4a6e', // Tailwind sky-900
                color: 'white',
                '--ps-menu-button-hover-bg': '#0369a1', // Tailwind sky-700
                '--ps-menu-button-active-bg': '#075985', // Tailwind sky-800
            }}
        >
            {children}
        </MenuItem>
    );
};

export default ThemedMenuItem;
