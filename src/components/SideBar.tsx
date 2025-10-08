import React, { useState } from 'react';
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import ThemedMenuItem from './ThemedMenuItem';

// Forms
const IssuerForm: React.FC<{ onNext: () => void }> = ({ onNext }) => (
    <div>
        <h2>Issuer Form</h2>
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onNext();
            }}
        >
            <input type="text" placeholder="Issuer Name" />
            <button type="submit">Next</button>
        </form>
    </div>
);

const IssuanceForm: React.FC<{ onNext: () => void }> = ({ onNext }) => (
    <div>
        <h2>Issuance Form</h2>
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onNext();
            }}
        >
            <input type="text" placeholder="Amount" />
            <button type="submit">Next</button>
        </form>
    </div>
);

const SeriesForm: React.FC<{ onNext: () => void }> = ({ onNext }) => (
    <div>
        <h2>Series Form</h2>
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onNext();
            }}
        >
            <button type="submit">Next</button>
        </form>
    </div>
);

const MaturityForm: React.FC<{ onNext: () => void }> = ({ onNext }) => (
    <div>
        <h2>Maturity Form</h2>
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onNext();
            }}
        >
            <button type="submit">Next</button>
        </form>
    </div>
);

const DebtServiceForm: React.FC = () => (
    <div>
        <h2>Debt Service Form</h2>
        <form>
            <button type="submit">Finish</button>
        </form>
    </div>
);

const DebtSidebar: React.FC = () => {
    const [step, setStep] = useState(0);

    const renderForm = () => {
        switch (step) {
            case 0:
                return <IssuerForm onNext={() => setStep(1)} />;
            case 1:
                return <IssuanceForm onNext={() => setStep(2)} />;
            case 2:
                return <SeriesForm onNext={() => setStep(3)} />;
            case 3:
                return <MaturityForm onNext={() => setStep(4)} />;
            case 4:
                return <DebtServiceForm />;
            default:
                return <div>Complete the sequence to proceed</div>;
        }
    };

    return (
        <div className="h-screen flex bg-sky-900">
            <Sidebar className='bg-sky-900 !important'>
                <Menu className='bg-sky-900 text-white'>
                    <SubMenu className='bg-sky-900 text-white' label="Debt">
                        <ThemedMenuItem disabled={step !== 0}>Issuer</ThemedMenuItem>
                        <ThemedMenuItem disabled={step !== 1}>Issuance</ThemedMenuItem>
                        <ThemedMenuItem disabled={step !== 2}>Series</ThemedMenuItem>
                        <ThemedMenuItem disabled={step !== 3}>Maturity</ThemedMenuItem>
                        <ThemedMenuItem disabled={step !== 4}>Debt Service</ThemedMenuItem>
                    </SubMenu>
                </Menu>
            </Sidebar>

            <main className="flex-1 p-6">{renderForm()}</main>
        </div>
    );
};

export default DebtSidebar;
