import React from 'react';
import CustomSideBar from './components/SideBar';
import { store } from './store';
import { Provider } from 'react-redux';


const App: React.FC = () => {
    return (
        <Provider store={store}>
            <CustomSideBar />
        </Provider>
    );
};

export default App;

