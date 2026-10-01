import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/map.css";

const ParkingLot = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const parkingLot = state?.parkingLot;

    if (!parkingLot) return <div>ไม่พบข้อมูลลานจอด</div>;

    const handleLot = async (id) => {
        try {
            const res = await axios.get(
                `http://localhost:8080/api/parkingLot/slots?id=${id}`,
                { withCredentials:true }
            );

            navigate("/home/parkingLot/parkingSlots", {
                state:{
                    slots:res.data.data,
                    parkingLot_id:id
                }
            });
        } catch(error) {
            console.log("โหลดช่องจอดไม่สำเร็จ", error);
        }
    };

    const handleNavigate = (lot) => {
        window.open(
            `https://www.google.com/maps/dir/?api=1&destination=${lot.latitude},${lot.longitude}`,
            "_blank"
        );
    };

    return (
        <div className="map-page">
            <div className="map-box">
                <MapContainer center={[13.75,100.52]} zoom={13}>
                    <TileLayer
                        attribution="OpenStreetMap"
                        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {parkingLot.map(lot => (
                        <Marker
                            key={lot.parkinglot_id}
                            position={[Number(lot.latitude), Number(lot.longitude)]}
                        >
                            <Popup>
                                <h3 style={{ backgroundColor: 'white' }}>{lot.parkinglot_name}</h3>
                                <p style={{ backgroundColor: 'white' }}>ราคา {lot.price_per_hour} บาท/ชั่วโมง</p>
                                <button onClick={() => handleNavigate(lot)} style={{ backgroundColor: 'white' }}>นำทางไปลานจอด</button>
                                <br/><br/>
                                <button onClick={() => handleLot(lot.parkinglot_id)} style={{ backgroundColor: 'white' }}>ดูช่องจอด</button>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
};

export default ParkingLot;