import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddProfessor = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    third_name: '',
    birth_date: '',
    email: '',
    phone_number: '',
    office: '',
    degree: '',
    position: '',
    work_time: '',
  });
  const [offices, setOffices] = useState([]);
  const [degrees, setDegrees] = useState([]);
  const [positions, setPositions] = useState([]);
  const [workTimes, setWorkTimes] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [officesRes, degreesRes, positionsRes, workTimesRes] = await Promise.all([
          axios.get('http://localhost:8000/api/offices/'),
          axios.get('http://localhost:8000/api/degrees/'),
          axios.get('http://localhost:8000/api/positions/'),
          axios.get('http://localhost:8000/api/work-times/'),
        ]);
        setOffices(officesRes.data);
        setDegrees(degreesRes.data);
        setPositions(positionsRes.data);
        setWorkTimes(workTimesRes.data);
      } catch (error) {
        setMessage('Ошибка загрузки данных: ' + error.message);
      }
    };
    fetchOptions();
  }, []);

  const handleChange = (e) => {
    console.log(`Изменение ${e.target.name}: ${e.target.value}`);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSend = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      third_name: formData.third_name || null,
      birth_date: formData.birth_date,
      email: formData.email,
      phone_number: formData.phone_number,
      office: formData.office ? parseInt(formData.office) : null,
      degree: formData.degree ? parseInt(formData.degree) : null,
      position: formData.position ? parseInt(formData.position) : null,
      work_time: formData.work_time ? parseInt(formData.work_time) : null,
    };
    console.log('Отправляемые данные:', dataToSend);
    if (!dataToSend.position || !dataToSend.work_time) {
      setMessage('Пожалуйста, выберите должность и ставку.');
      return;
    }
    try {
      const response = await axios.post('http://localhost:8000/api/professors/', dataToSend, {
        headers: { 'Content-Type': 'application/json' },
      });
      console.log('Ответ сервера:', response.data);
      setMessage('Преподаватель успешно добавлен!');
      setTimeout(() => {
        setMessage('');
        if (onSuccess) onSuccess(); // Вызываем onSuccess для обновления списка
        onClose();
      }, 2000);
      setFormData({
        first_name: '',
        last_name: '',
        third_name: '',
        birth_date: '',
        email: '',
        phone_number: '',
        office: '',
        degree: '',
        position: '',
        work_time: '',
      });
    } catch (error) {
      console.error('Ошибка:', error.response ? error.response.data : error.message);
      setMessage('Ошибка при добавлении: ' + (error.response?.data?.detail || error.message));
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl text-[#0F9244] font-bold mb-4">Добавить преподавателя</h2>
      {message && <p className="mb-4 text-red-500">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="first_name"
          value={formData.first_name}
          onChange={handleChange}
          placeholder="Имя"
          className="w-full p-2 text-gray-700 border rounded"
          required
        />
        <input
          type="text"
          name="last_name"
          value={formData.last_name}
          onChange={handleChange}
          placeholder="Фамилия"
          className="w-full p-2 text-gray-700 border rounded"
          required
        />
        <input
          type="text"
          name="third_name"
          value={formData.third_name}
          onChange={handleChange}
          placeholder="Отчество (опционально)"
          className="w-full p-2 text-gray-700 border rounded"
        />
        <input
          type="date"
          name="birth_date"
          value={formData.birth_date}
          onChange={handleChange}
          className="w-full p-2 text-gray-700 border rounded"
          required
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full p-2 text-gray-700 border rounded"
          required
        />
        <input
          type="text"
          name="phone_number"
          value={formData.phone_number}
          onChange={handleChange}
          placeholder="Телефон (11 цифр)"
          className="w-full p-2 text-gray-700 border rounded"
          required
        />
        <select
          name="office"
          value={formData.office}
          onChange={handleChange}
          className="w-full p-2 text-gray-700 border rounded cursor-pointer"
        >
          <option value="">Выберите кабинет</option>
          {offices.map((office) => (
            <option key={office.id} value={office.id}>
              {office.number}
            </option>
          ))}
        </select>
        <select
          name="degree"
          value={formData.degree}
          onChange={handleChange}
          className="w-full p-2 text-gray-700 border rounded cursor-pointer"
        >
          <option value="">Выберите степень</option>
          {degrees.map((degree) => (
            <option key={degree.id} value={degree.id}>
              {degree.name}
            </option>
          ))}
        </select>
        <select
          name="position"
          value={formData.position}
          onChange={handleChange}
          className="w-full p-2 text-gray-700 border rounded cursor-pointer"
          required
        >
          <option value="">Выберите должность</option>
          {positions.map((position) => (
            <option key={position.id} value={position.id}>
              {position.name}
            </option>
          ))}
        </select>
        <select
          name="work_time"
          value={formData.work_time}
          onChange={handleChange}
          className="w-full p-2 text-gray-700 border rounded cursor-pointer"
          required
        >
          <option value="">Выберите ставку</option>
          {workTimes.map((workTime) => (
            <option key={workTime.id} value={workTime.id}>
              {workTime.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600 cursor-pointer"
        >
          Добавить
        </button>
      </form>
    </div>
  );
};

export default AddProfessor;