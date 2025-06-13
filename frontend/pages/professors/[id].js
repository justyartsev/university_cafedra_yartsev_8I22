import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const ProfessorDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const [professor, setProfessor] = useState(null);
  const [disciplines, setDisciplines] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedDiscipline, setSelectedDiscipline] = useState('');
  const [teachingTypes, setTeachingTypes] = useState({
    'Лекции': false,
    'Практики': false,
    'Лабораторные': false,
  });

  useEffect(() => {
    // Проверяем, определен ли id и является ли он строкой
    if (id && typeof id === 'string') {
      const fetchProfessor = async () => {
        try {
          const response = await axios.get(`http://localhost:8000/api/professors/${id}/`);
          console.log('Данные преподавателя:', response.data);
          setProfessor(response.data);
        } catch (error) {
          console.error('Ошибка загрузки данных преподавателя:', error);
          if (error.response && error.response.status === 404) {
            alert('Преподаватель не найден');
            router.push('/'); // Перенаправление на главную страницу при 404
          }
        }
      };
      fetchProfessor();
    } else {
      console.warn('ID не определен, перенаправление на главную страницу');
      router.push('/'); // Перенаправление, если id отсутствует
    }
  }, [id, router]);

  useEffect(() => {
    const fetchDisciplines = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/disciplines/`);
        setDisciplines(response.data);
      } catch (error) {
        console.error('Ошибка загрузки дисциплин:', error);
      }
    };
    fetchDisciplines();
  }, []);

  if (!professor) return <div className="p-4">Загрузка...</div>;

  // Фильтрация дисциплин по типам с защитой от undefined
  const existingDisciplines = professor.disciplines || [];
  const lectures = existingDisciplines.filter(d => d.teaching_type_detail?.name === 'Лекции');
  const practices = existingDisciplines.filter(d => d.teaching_type_detail?.name === 'Практики');
  const labs = existingDisciplines.filter(d => d.teaching_type_detail?.name === 'Лабораторные');

  const navigateTo = (path) => {
    router.push(path);
  };

  const isActive = (path) => router.pathname === path || (path === '/' && router.pathname === '/professors/[id]');

  const handleRemoveDiscipline = async (professorDisciplineId) => {
    if (confirm('Вы уверены, что хотите открепить дисциплину от преподавателя?')) {
      try {
        await axios.delete(`http://localhost:8000/api/professor-disciplines/${professorDisciplineId}/`);
        // Обновляем данные после удаления
        const response = await axios.get(`http://localhost:8000/api/professors/${id}/`);
        console.log('Обновленные данные преподавателя:', response.data);
        setProfessor(response.data);
      } catch (error) {
        console.error('Ошибка при удалении дисциплины:', error);
        alert('Не удалось открепить дисциплину');
      }
    }
  };

  const handleRemoveProfessor = async () => {
    if (confirm('Вы уверены, что хотите удалить преподавателя? Это действие необратимо!')) {
      try {
        await axios.delete(`http://localhost:8000/api/professors/${id}/`);
        alert('Преподаватель успешно удален');
        router.push('/'); // Перенаправление на главную страницу после удаления
      } catch (error) {
        console.error('Ошибка при удалении преподавателя:', error);
        alert('Не удалось удалить преподавателя');
      }
    }
  };

  const handleTeachingTypeChange = (type) => {
    setTeachingTypes((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const handleAddDiscipline = async (e) => {
    e.preventDefault();
    if (!selectedDiscipline || !Object.values(teachingTypes).some((checked) => checked)) {
      alert('Выберите дисциплину и хотя бы один тип преподавания');
      return;
    }

    try {
      const teachingTypeResponse = await axios.get(`http://localhost:8000/api/teaching-types/`);
      console.log('Типы преподавания:', teachingTypeResponse.data);
      const teachingTypeMap = {
        'Лекции': teachingTypeResponse.data.find((tt) => tt.name === 'Лекции')?.id,
        'Практики': teachingTypeResponse.data.find((tt) => tt.name === 'Практики')?.id,
        'Лабораторные': teachingTypeResponse.data.find((tt) => tt.name === 'Лабораторные')?.id,
      };
      console.log('teachingTypeMap:', teachingTypeMap);

      const promises = Object.entries(teachingTypes)
        .filter(([_, checked]) => checked)
        .map(([type]) => {
          const teachingTypeId = teachingTypeMap[type];
          if (!teachingTypeId) {
            throw new Error(`Тип преподавания "${type}" не найден`);
          }
          console.log('Отправляемые данные:', {
            professor: parseInt(id),
            discipline: parseInt(selectedDiscipline),
            teaching_type: teachingTypeId,
          });
          return axios.post(`http://localhost:8000/api/professor-disciplines/`, {
            professor: parseInt(id),
            discipline: parseInt(selectedDiscipline),
            teaching_type: teachingTypeId,
          }, {
            headers: { 'Content-Type': 'application/json' }
          });
        });

      await Promise.all(promises);
      setShowForm(false);
      setSelectedDiscipline('');
      setTeachingTypes({ 'Лекции': false, 'Практики': false, 'Лабораторные': false });
      const response = await axios.get(`http://localhost:8000/api/professors/${id}/`);
      console.log('Данные после добавления:', response.data);
      setProfessor(response.data);
      alert('Дисциплина успешно добавлена');
    } catch (error) {
      console.error('Ошибка при добавлении дисциплины:', error);
      if (error.response) {
        console.error('Ответ сервера:', error.response.data);
      }
      alert('Не удалось добавить дисциплину');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Панель навигации */}
      <nav className="bg-black text-white p-4 flex justify-between items-center">
        <div className="space-x-4">
          <span
            className={`hover:underline cursor-pointer ${isActive('/') ? 'border-b-2 border-green-500' : ''}`}
            onClick={() => navigateTo('/')}
          >
            Преподаватели
          </span>
          <span
            className={`hover:underline cursor-pointer ${isActive('/disciplines') ? 'border-b-2 border-green-500' : ''}`}
            onClick={() => navigateTo('/disciplines')}
          >
            Дисциплины
          </span>
          <span
            className={`hover:underline cursor-pointer ${isActive('/references') ? 'border-b-2 border-green-500' : ''}`}
            onClick={() => navigateTo('/references')}
          >
            Справочники
          </span>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Введите данные"
            className="p-2 rounded border border-gray-300"
          />
          <span className="absolute right-2 top-2 text-gray-500">🔍</span>
        </div>
      </nav>

      {/* Детали преподавателя */}
      <div className="p-4 max-w-4xl mx-auto">
        <div className="bg-white text-gray-800 rounded-lg shadow p-6">
          <h1 className="text-2xl text-gray-800 font-bold mb-4">{professor.last_name} {professor.first_name} {professor.third_name || ''}</h1>
          <div className="flex items-center">
            <img src="https://via.placeholder.com/100" alt="Avatar" className="mr-6" />
            <div>
              <h2 className="text-lg font-semibold text-green-600">Персональные информация</h2>
              <p>Ученая степень: {professor.degree ? professor.degree.name : 'Не указана'}</p>
              <p>Должность: {professor.position ? professor.position.name : 'Не указана'}</p>
              <p>Кабинет: {professor.office ? professor.office.number : 'Не указан'}</p>
              <p>Ставка: {professor.work_time ? professor.work_time.name : 'Не указана'}</p>
              <p>Дата рождения: {new Date(professor.birth_date).toLocaleDateString()}</p>
              <p>Номер телефона: {professor.phone_number}</p>
              <p>Электронная почта: {professor.email}</p>
            </div>
          </div>
          <div className="mt-4 flex space-x-2">
            <button className="bg-green-500 text-white p-2 rounded hover:bg-green-600">Изменить информацию</button>
            <button
              className="bg-red-500 text-white p-2 rounded hover:bg-red-600 cursor-pointer"
              onClick={handleRemoveProfessor}
            >
              Удалить преподавателя
            </button>
          </div>
        </div>

        {/* Дисциплины */}
        <div className="bg-white text-gray-800 rounded-lg shadow p-6 mt-4">
          <h2 className="text-lg font-semibold text-green-600">Дисциплины</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-black font-bold">Лекции</h3>
              <ul>
                {lectures.length > 0 ? (
                  lectures.map((item) => (
                    <li key={item.id} className="border-b py-2 flex justify-between">
                      <span 
                        className="hover:text-green-600 cursor-pointer"
                        onClick={() => router.push(`/disciplines/${item.discipline_detail.id}`)}
                      >
                        {item.discipline_detail.name}
                      </span>
                      <button 
                        onClick={() => handleRemoveDiscipline(item.id)}
                        className="text-red-500 hover:text-red-700 cursor-pointer"
                      >
                        Удалить
                      </button>
                    </li>
                  ))
                ) : (
                  <li>Нет лекций</li>
                )}
              </ul>
            </div>
            <div>
              <h3 className="text-black font-bold">Практики</h3>
              <ul>
                {practices.length > 0 ? (
                  practices.map((item) => (
                    <li key={item.id} className="border-b py-2 flex justify-between">
                      <span 
                        className="hover:text-green-600 cursor-pointer"
                        onClick={() => router.push(`/disciplines/${item.discipline_detail.id}`)}
                      >
                        {item.discipline_detail.name}
                      </span>
                      <button 
                        onClick={() => handleRemoveDiscipline(item.id)}
                        className="text-red-500 hover:text-red-700 cursor-pointer"
                      >
                        Удалить
                      </button>
                    </li>
                  ))
                ) : (
                  <li>Нет практик</li>
                )}
              </ul>
            </div>
            <div>
              <h3 className="text-black font-bold">Лабораторные</h3>
              <ul>
                {labs.length > 0 ? (
                  labs.map((item) => (
                    <li key={item.id} className="border-b py-2 flex justify-between">
                      <span 
                        className="hover:text-green-600 cursor-pointer"
                        onClick={() => router.push(`/disciplines/${item.discipline_detail.id}`)}
                      >
                        {item.discipline_detail.name}
                      </span>
                      <button 
                        onClick={() => handleRemoveDiscipline(item.id)}
                        className="text-red-500 hover:text-red-700 cursor-pointer"
                      >
                        Удалить
                      </button>
                    </li>
                  ))
                ) : (
                  <li>Нет лабораторных</li>
                )}
              </ul>
            </div>
          </div>
          <button
            className="bg-green-500 text-white p-2 rounded mt-2 hover:bg-green-600 cursor-pointer"
            onClick={() => setShowForm(true)}
          >
            Добавить дисциплину...
          </button>

          {showForm && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50 ">
              <h2 className="text-lg font-semibold mb-2">Добавить дисциплину</h2>
              <form onSubmit={handleAddDiscipline}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Дисциплина</label>
                  <select
                    value={selectedDiscipline}
                    onChange={(e) => setSelectedDiscipline(e.target.value)}
                    className="mt-1 p-2 w-full border rounded cursor-pointer"
                  >
                    <option value="">Выберите дисциплину</option>
                    {disciplines.map((disc) => (
                      <option key={disc.id} value={disc.id}>
                        {disc.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Тип преподавания</label>
                  {['Лекции', 'Практики', 'Лабораторные'].map((type) => (
                    <div key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={teachingTypes[type]}
                        onChange={() => handleTeachingTypeChange(type)}
                        className="mr-2"
                      />
                      <label>{type}</label>
                    </div>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="bg-green-500 text-white p-2 rounded hover:bg-green-600 cursor-pointer"
                  >
                    Добавить
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600 cursor-pointer"
                  >
                    Отмена
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Дополнительные активности */}
        <div className="bg-white text-gray-800 rounded-lg shadow p-6 mt-4">
          <h2 className="text-lg font-semibold text-green-600">Дополнительные активности</h2>
          {professor.activities && professor.activities.length > 0 ? (
            professor.activities.map((item) => (
              <div key={item.id} className="border-b py-2">
                <h3 className="text-black font-bold">{item.activity.name}</h3>
                <p>{item.description || 'Нет описания'}</p>
              </div>
            ))
          ) : (
            <p>Нет активностей</p>
          )}
          <button className="bg-green-500 text-white p-2 rounded mt-2 hover:bg-green-600">Добавить активность...</button>
        </div>
        
      </div>
    </div>
  );
};

export default ProfessorDetail;