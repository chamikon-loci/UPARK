import axios from "axios";
import { useEffect, useState } from "react";
import '../styles/parking.css';

const Parking = ({ user }) => {
    const [parkingHistory, setParkingHistory] = useState([]);
    const [ratings, setRatings] = useState([]);
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [score, setScore] = useState(5);
    const [comment, setComment] = useState("");

    useEffect(() => {
        if (!user) return;

        const getParkingHistory = async () => {
            try {
                const res = await axios.get(`http://localhost:8080/api/reservation/getParkingHistory?user_id=${user.user_id}`, { withCredentials: true });
                setParkingHistory(res.data.data);
            } catch (error) {
                console.log("ดึง Parking History ไม่สำเร็จ", error);
            }
        };

        const getMyRatings = async () => {
            try {
                const res = await axios.get(`http://localhost:8080/api/rating/getMyRatings?user_id=${user.user_id}`, { withCredentials: true });
                setRatings(res.data.data);
            } catch (error) {
                console.log("ดึง Rating ไม่สำเร็จ", error);
            }
        };

        getParkingHistory();
        getMyRatings();
    }, [user]);

    const getRating = reservation_id => {
        return ratings.find(rating => Number(rating.reservation_id) === Number(reservation_id));
    };

    const handleOpenRating = reservation_id => {
        setSelectedReservation(reservation_id);
        setScore(5);
        setComment("");
    };

    const handleSubmitRating = async () => {
        if (!selectedReservation) return;

        try {
            const res = await axios.post("http://localhost:8080/api/rating/createRating", {
                user_id: user.user_id,
                reservation_id: selectedReservation,
                score,
                comment
            }, { withCredentials: true });

            alert(res.data.message);
            setRatings([res.data.data, ...ratings]);
            setSelectedReservation(null);
            setScore(5);
            setComment("");
        } catch (error) {
            alert(error.response?.data?.message || "ให้คะแนนไม่สำเร็จ");
        }
    };

    if (!user) return <div>กำลังโหลดข้อมูล...</div>;

    return (
        <div className="parking-container">
            <h1>Parking History</h1>
            <p className="parking-user">ประวัติการจอดรถของ {user.username}</p>

            {parkingHistory.length === 0 ? (
                <div className="no-parking">ยังไม่มีประวัติการจอดรถ</div>
            ) : (
                <div className="parking-list">
                    {parkingHistory.map(parking => {
                        const rating = getRating(parking.reservation_id);

                        return (
                            <div className="parking-card" key={parking.reservation_id}>
                                <h3 style={{ backgroundColor: 'white' }}>Parking #{parking.reservation_id}</h3>

                                <p className="parking-info" style={{ backgroundColor: 'white' }}><strong style={{ backgroundColor: 'white' }}>รถ:</strong> {parking.car_brand} {parking.car_model}</p>
                                <p className="parking-info" style={{ backgroundColor: 'white' }}><strong style={{ backgroundColor: 'white' }}>ทะเบียน:</strong> {parking.license_plate}</p>
                                <p className="parking-info" style={{ backgroundColor: 'white' }}> <strong style={{ backgroundColor: 'white' }}>ลาน:</strong> {parking.parkinglot_name}</p>
                                <p className="parking-info" style={{ backgroundColor: 'white' }}><strong style={{ backgroundColor: 'white' }}>ช่อง:</strong> {parking.parkingslot_name}</p>
                                <p className="parking-info" style={{ backgroundColor: 'white' }}><strong style={{ backgroundColor: 'white' }}>Check In:</strong> {new Date(parking.check_in_at).toLocaleString()}</p>
                                <p className="parking-info" style={{ backgroundColor: 'white' }}><strong style={{ backgroundColor: 'white' }}>Check Out:</strong> {new Date(parking.check_out_at).toLocaleString()}</p>

                                {rating ? (
                                    <div style={{ backgroundColor: 'white', marginTop: '15px', padding: '15px' }}>
                                        <h3 style={{ backgroundColor: 'white' }}>ความพึงพอใจ</h3>
                                        <p style={{ backgroundColor: 'white' }}>
                                            คะแนน: {"⭐".repeat(rating.score)}
                                        </p>

                                        {rating.comment && (
                                            <p style={{ backgroundColor: 'white' }}>
                                                ความคิดเห็น: {rating.comment}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <div style={{ backgroundColor: 'white', marginTop: '15px' }}>
                                        {selectedReservation === parking.reservation_id ? (
                                            <div style={{ backgroundColor: 'white', padding: '15px' }}>
                                                <h3 style={{ backgroundColor: 'white' }}>ประเมินความพึงพอใจ</h3>

                                                <p style={{ backgroundColor: 'white' }}>คะแนน</p>

                                                <div style={{ backgroundColor: 'white', fontSize: '30px' }}>
                                                    {[1, 2, 3, 4, 5].map(number => (
                                                        <button
                                                            key={number}
                                                            onClick={() => setScore(number)}
                                                            style={{
                                                                backgroundColor: 'white',
                                                                border: 'none',
                                                                cursor: 'pointer',
                                                                fontSize: '30px',
                                                                opacity: number <= score ? 1 : 0.3
                                                            }}
                                                        >
                                                            ⭐
                                                        </button>
                                                    ))}
                                                </div>

                                                <p style={{ backgroundColor: 'white' }}>ความคิดเห็น</p>

                                                <textarea
                                                    value={comment}
                                                    onChange={e => setComment(e.target.value)}
                                                    placeholder="แสดงความคิดเห็นเกี่ยวกับการใช้บริการ"
                                                    rows="4"
                                                    style={{ width: '100%', backgroundColor: 'white' }}
                                                />

                                                <div style={{ backgroundColor: 'white', marginTop: '10px' }}>
                                                    <button onClick={handleSubmitRating}>ส่งคะแนน</button>
                                                    <button onClick={() => setSelectedReservation(null)}>ยกเลิก</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button onClick={() => handleOpenRating(parking.reservation_id)}>
                                                ⭐ ประเมินความพึงพอใจ
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Parking;