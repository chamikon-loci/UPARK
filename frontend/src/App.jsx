import axios from 'axios';
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CarInfo from './pages/CarInfo';
import Wallet from './pages/Wallet';
import ParkingLot from './pages/ParkingLot';
import ParkingSlot from './pages/ParkingSlot';
import Admin from './pages/Admin';
import Staff from './pages/Staff';
import Reservation from './pages/Reservation';
import Transaction from './pages/Transaction';
import Parking from './pages/Parking';


function App() {

  const [user, setUser] = useState(null);
  const [car, setCar] = useState();
  const [wallet, setWallet] = useState();

  useEffect(() => {
    const fetchUserData = async () => {
        try {
          const res = await axios.get('http://localhost:8080/api/auth/me', { withCredentials: true });
          setUser(res.data);
          console.log('คุณคือ: ', res.data.username);

          const yourcar = await axios.get('http://localhost:8080/api/vechicle/getCar', { withCredentials: true });
          setCar(yourcar.data.car);
          console.log('รถทั้งหมดของคุณ: ',yourcar.data.car);

          const yourWallet = await axios.get('http://localhost:8080/api/wallet/getWallet', { withCredentials: true });
          setWallet(yourWallet.data.data);
          console.log('กระเป๋าเงินทั้งหมด: ', yourWallet.data.data);

        } catch (error) {
          setUser(null);
          setCar([]);
          setWallet([]);
        }
    }
    fetchUserData();
  }, []) 

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register />}/>
        <Route path="/" element={<Login setUser={setUser} />}/>

        <Route path="/home" element={<Home user={user}/>}/>
        <Route path="/home/carinfo" element={<CarInfo user={user} car={car} />} />
        <Route path="/home/wallet" element={<Wallet user={user} wallet={wallet}/>} />
        <Route path="/home/parkingLot" element={<ParkingLot user={user}/>} />
        <Route path="/home/parkingLot/parkingSlots" element={<ParkingSlot user={user} car={car}/>} />
        <Route path="/Admin" element={<Admin user={user}/>} />
        <Route path="/Staff" element={<Staff user={user}/>} />
        <Route path="/home/reservation" element={<Reservation user={user} />} />
        <Route path="/home/transaction" element={<Transaction user={user} />} />
        <Route path="/home/parking" element={<Parking user={user} />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
