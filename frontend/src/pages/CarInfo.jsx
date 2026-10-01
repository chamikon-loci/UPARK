import axios from "axios";
import { useState } from "react";
import { CarCard } from "../components/CarCard";
import '../styles/yourcar.css'

const CarInfo = ({user, car}) => {

    const [form, setForm] = useState({
        car_brand: '',
        car_model: '',
        color: '',
        license_plate: '',
        province: '',
        user_id: user?.user_id || ''
    });

    if (!user || !car) {
        return <div>กำลังโหลดข้อมูล...</div>;
    }

    const yourcar = car.filter(thecar => thecar.user_id === user.user_id);
    if(yourcar.length > 0){
        return (
            <div className="car-container">
                <h2 className="car-title">PARKING</h2>
                <div className="car-box">
                    <h3>รถของคุณ</h3>
                    <CarCard car={car} user={user}/>
                </div>
            </div>
        )
    }

    const id = user.user_id;

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {

            const res = await axios.post('http://localhost:8080/api/vechicle/addCar', form,{ withCredentials: true });

            if(res.status === 201){
                console.log('บันทึกสำเร็จ');
            }
        } catch (error) {
            console.log('เกิดข้อผิดพลาดในการบันทึกข้อมูลรถ');
        }
    }

    return (
        <div className="car-container">
            <h2 className="car-title">PARKING</h2>
            <div className="car-box">
                <h1>เพิ่มรถ</h1>
                <form onSubmit={handleSubmit} className="car-form">
                    <input placeholder="ยี่ห้อรถ" value={form.car_brand} onChange={(e) => setForm({...form, car_brand: e.target.value})}/>
                    <input placeholder="รุ่นรถ" value={form.car_model} onChange={(e) =>setForm({...form,car_model: e.target.value})}/>
                    <input placeholder="สีรถ"value={form.color} onChange={(e) => setForm({...form,color: e.target.value})}/>
                    <input placeholder="เลขป้ายทะเบียน" value={form.license_plate} onChange={(e) => setForm({...form, license_plate: e.target.value})}/>
                    <input placeholder="จังหวัด" value={form.province} onChange={(e) => setForm({...form, province: e.target.value})}/>
                    <button type="submit"> เพิ่ม</button>
                </form>
            </div>
        </div>
    )
}

export default CarInfo;