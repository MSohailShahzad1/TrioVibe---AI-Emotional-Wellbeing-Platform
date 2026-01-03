import {React,useState} from 'react'

import Login from './Components/Login/Login'
import Home from './Components/Home/Home'
import AppLayout from './Components/LayOut/Applayout';




const App = () => {
  const [authenticated, setAuthenticated] = useState(false);

  // Function to handle successful authentication
  const handleLogin = () => {
    setAuthenticated(true);
  };

  return (
    <>
    
      {authenticated ? (
        <div>
         {/* <Home/> */}
         <AppLayout/>
        </div>
      ) : (
        <Login onLogin={handleLogin} />
      )}
      
      </>
    
  );
};

export default App;
