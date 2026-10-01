import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import {MapContainer, TileLayer, Marker} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import '../styles/map.css'

const ParkingLot = () => {

    const location = useLocation();
    const parkingLot = location.state?.parkingLot;

    if (!parkingLot) {
        return (
            <div>
                ไม่พบข้อมูลลานจอด
            </div>
        );
    }
    
    const navigate = useNavigate()

    const handleLot = async (id) => {
        const res = await axios.get(`http://localhost:8080/api/parkingLot/slots?id=${id}`, {withCredentials: true})
        const result = res.data.data

        console.log(`ช่องจอดที่พบสำหรับลานจอด ID ${id}`, result)

        navigate('/home/parkingLot/parkingSlots', {
            state: {
                slots: result,
                parkingLot_id: id
            }
        })
    }

    return (
        <div className="map-page">
            <div className="map-box">
                <MapContainer center={[13.75, 100.52]} zoom={13}>
                    <TileLayer 
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {parkingLot.map(lot => (
                        <Marker
                            position={[Number(lot.latitude), Number(lot.longitude)]}
                            eventHandlers={{
                                click: () => handleLot(lot.parkinglot_id)
                            }}
                        />
                    ))}
                </MapContainer>
            </div>
        </div>
    );
};

export default ParkingLot;