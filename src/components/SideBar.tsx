import React, { useState } from 'react';
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { GoSidebarCollapse  } from "react-icons/go";
import IssuerForm from './Debt/Issuer';
import IssuanceForm from './Debt/Issuance';
import SeriesForm from './Debt/Series';
import MaturityForm from './Debt/Maturity';
import DebtServiceForm from './Debt/DebtService';


const DebtSidebar: React.FC = () => {
    const [step, setStep] = useState(0);
    const [collapsed, setCollapsed] = useState(false);

    const renderForm = () => {
        switch (step) {
            case 0:
                return <IssuerForm onNext={() => setStep(1)} />;
            case 1:
                return <IssuanceForm onSubmit={() => setStep(2)} onBack={() => setStep(0)} />;
            case 2:
                return <SeriesForm onSubmit={() => setStep(3)} onBack={() => setStep(1)} />;
            case 3:
                return <MaturityForm onNext={() => setStep(4)} onBack={() => setStep(2)} />;
            case 4:
                return <DebtServiceForm onNext={() => setStep(5)} onBack={() => setStep(4)} />;
            default:
                return <div>Complete the sequence to proceed</div>;
        }
    };

    return (
        <div className="h-screen flex">
            <Sidebar collapsed={collapsed} breakPoint='md'>
                <div className='flex justify-end bg-sky-900'>
                    <button onClick={() => setCollapsed(!collapsed)} className="hover:bg-sky-950 hover:cursor-pointer p-2">
                        <GoSidebarCollapse />
                    </button>
                </div>
                <Menu>
                    <SubMenu label="Debt">
                        <MenuItem disabled={step !== 0}>Issuer</MenuItem>
                        <MenuItem disabled={step !== 1}>Issuance</MenuItem>
                        <MenuItem disabled={step !== 2}>Series</MenuItem>
                        <MenuItem disabled={step !== 3}>Maturity</MenuItem>
                        <MenuItem disabled={step !== 4}>Debt Service</MenuItem>
                    </SubMenu>
                </Menu>
            </Sidebar>
            <main className="flex-1 p-6 overflow-auto">{renderForm()}</main>
        </div>
    );
};

export default DebtSidebar;
