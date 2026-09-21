export const CarCard = ({car, user}) => {

    const yourcar = car.filter(thecar => thecar.user_id === user.user_id);
    const carlist = yourcar.map(thecar => 
        <div className="car-card" key={thecar.vechicle_id}>
            <p className="car-brand">{thecar.car_brand}</p>
            <p><span>รุ่น</span>{thecar.car_model}</p>
            <p><span>สี</span>{thecar.color}</p>
            <p><span>ทะเบียน</span>{thecar.license_plate}</p>
            <p><span>จังหวัด</span>{thecar.province}</p>
        </div>
    )

    return <div className="car-list">{carlist}</div>
}
