import React, { useState } from 'react';
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { GoSidebarCollapse  } from "react-icons/go";
import SeriesForm from './Debt/Series';
import MaturityForm from './Debt/Maturity';
import DebtServiceForm from './Debt/DebtService';


const DebtSidebar: React.FC = () => {
    const [step, setStep] = useState(0);
    const [collapsed, setCollapsed] = useState(false);

    const renderForm = () => {
        switch (step) {
            case 0:
                return <SeriesForm onNext={() => setStep(3)} onBack={() => setStep(1)} />;
            case 1:
                return <MaturityForm onNext={() => setStep(4)} onBack={() => setStep(2)} />;
            case 2:
                return <DebtServiceForm onNext={() => setStep(5)} onBack={() => setStep(4)} />;
            default:
                return <div>Complete the sequence to proceed</div>;
        }
    };

    return (
        <div className="h-screen flex">
            <Sidebar collapsed={collapsed} breakPoint='md'>
                <div className='flex justify-end bg-sky-600'>
                    <button onClick={() => setCollapsed(!collapsed)} className="text-white hover:cursor-pointer p-2">
                        <GoSidebarCollapse />
                    </button>
                </div>
                <Menu>
                    <SubMenu label="Debt">
                        <MenuItem disabled={step !== 0}>Series</MenuItem>
                        <MenuItem disabled={step !== 1}>Maturity</MenuItem>
                        <MenuItem disabled={step !== 2}>Debt Service</MenuItem>
                    </SubMenu>
                </Menu>
            </Sidebar>
            <main className="flex-1 p-6 overflow-auto">{renderForm()}</main>
        </div>
    );
};

export default DebtSidebar;
