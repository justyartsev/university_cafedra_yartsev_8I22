import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const DisciplineDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const [discipline, setDiscipline] = useState(null);
  const [professors, setProfessors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedProfessor, setSelectedProfessor] = useState('');
  const [teachingTypes, setTeachingTypes] = useState({
    'Лекции': false,
    'Практики': false,
    'Лабораторные': false,
  });

  useEffect(() => {
    if (id) {
      const fetchDiscipline = async () => {
        try {
          const response = await axios.get(`http://localhost:8000/api/disciplines/${id}/`);
          console.log('Данные дисциплины:', response.data);
          setDiscipline(response.data);
        } catch (error) {
          console.error('Ошибка загрузки данных дисциплины:', error);
        }
      };
      fetchDiscipline();
    }
  }, [id]);

  useEffect(() => {
    const fetchProfessors = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/professors/`);
        setProfessors(response.data);
      } catch (error) {
        console.error('Ошибка загрузки преподавателей:', error);
      }
    };
    fetchProfessors();
  }, []);

  const handleRemoveProfessor = async (professorDisciplineId) => {
    if (confirm('Вы уверены, что хотите открепить преподавателя от дисциплины?')) {
      try {
        await axios.delete(`http://localhost:8000/api/professor-disciplines/${professorDisciplineId}/`);
        const response = await axios.get(`http://localhost:8000/api/disciplines/${id}/`);
        console.log('Обновленные данные дисциплины:', response.data);
        setDiscipline(response.data);
      } catch (error) {
        console.error('Ошибка при удалении:', error);
        alert('Не удалось открепить преподавателя');
      }
    }
  };

  const handleRemoveDiscipline = async () => {
    if (confirm('Вы уверены, что хотите удалить дисциплину? Это действие необратимо!')) {
      try {
        await axios.delete(`http://localhost:8000/api/disciplines/${id}/`);
        alert('Дисциплина успешно удалена');
        router.push('/disciplines'); // Перенаправление на список дисциплин
      } catch (error) {
        console.error('Ошибка при удалении дисциплины:', error);
        alert('Не удалось удалить дисциплину');
      }
    }
  };

  const handleTeachingTypeChange = (type) => {
    setTeachingTypes((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const handleAddProfessor = async (e) => {
    e.preventDefault();
    if (!selectedProfessor || !Object.values(teachingTypes).some((checked) => checked)) {
      alert('Выберите преподавателя и хотя бы один тип преподавания');
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
            professor: parseInt(selectedProfessor),
            discipline: parseInt(id),
            teaching_type: teachingTypeId,
          });
          return axios.post(`http://localhost:8000/api/professor-disciplines/`, {
            professor: parseInt(selectedProfessor),
            discipline: parseInt(id),
            teaching_type: teachingTypeId,
          }, {
            headers: { 'Content-Type': 'application/json' }
          });
        });

      await Promise.all(promises);
      setShowForm(false);
      setSelectedProfessor('');
      setTeachingTypes({ 'Лекции': false, 'Практики': false, 'Лабораторные': false });
      const response = await axios.get(`http://localhost:8000/api/disciplines/${id}/`);
      console.log('Данные после добавления:', response.data);
      setDiscipline(response.data);
      alert('Преподаватель успешно добавлен');
    } catch (error) {
      console.error('Ошибка при добавлении преподавателя:', error);
      if (error.response) {
        console.error('Ответ сервера:', error.response.data);
      }
      alert('Не удалось добавить преподавателя');
    }
  };

  if (!discipline) return <div className="p-4">Загрузка...</div>;

  const lectures = discipline.professordiscipline_set ? discipline.professordiscipline_set.filter((pd) => pd.teaching_type_detail?.name === 'Лекции') : [];
  const practices = discipline.professordiscipline_set ? discipline.professordiscipline_set.filter((pd) => pd.teaching_type_detail?.name === 'Практики') : [];
  const labs = discipline.professordiscipline_set ? discipline.professordiscipline_set.filter((pd) => pd.teaching_type_detail?.name === 'Лабораторные') : [];

  const navigateTo = (path) => {
    router.push(path);
  };

  const isActive = (path) => router.pathname === path || (path === '/disciplines' && router.pathname === '/disciplines/[id]');

  return (
    <div className="min-h-screen bg-gray-100">
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

      <div className="p-4 max-w-4xl mx-auto">
        <div className="bg-white text-gray-800 rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4">{discipline.name}</h1>
          <div className="flex space-x-2">
            <button
              className="bg-green-500 text-white p-2 rounded hover:bg-green-600 cursor-pointer"
              onClick={() => setShowForm(true)}
            >
              Добавить преподавателя
            </button>
            <button
              className="bg-red-500 text-white p-2 rounded hover:bg-red-600 cursor-pointer"
              onClick={handleRemoveDiscipline}
            >
              Удалить дисциплину
            </button>
          </div>

          {showForm && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
              <h2 className="text-lg font-semibold mb-2">Добавить преподавателя</h2>
              <form onSubmit={handleAddProfessor}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Преподаватель</label>
                  <select
                    value={selectedProfessor}
                    onChange={(e) => setSelectedProfessor(e.target.value)}
                    className="mt-1 p-2 w-full border rounded cursor-pointer"
                  >
                    <option value="">Выберите преподавателя</option>
                    {professors.map((prof) => (
                      <option key={prof.id} value={prof.id}>
                        {prof.last_name} {prof.first_name} {prof.third_name || ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Тип преподавания</label>
                  {['Лекции', 'Практики', 'Лабораторные'].map((type) => (
                    <div key={type} className="flex items-center ">
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

        <div className="bg-white text-gray-800 rounded-lg shadow p-6 mt-4">
          <h2 className="text-lg font-semibold text-green-600">Преподаватели</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-black font-bold">Лекции</h3>
              <ul>
                {lectures.length > 0 ? (
                  lectures.map((pd) => (
                    <li key={pd.id} className="border-b py-2 flex justify-between">
                      <span
                        className="hover:text-green-600 cursor-pointer"
                        onClick={() => {
                          console.log('Переход к преподавателю:', pd.professor_detail);
                          if (pd.professor_detail && pd.professor_detail.id) {
                            router.push(`/professors/${pd.professor_detail.id}`);
                          } else {
                            console.error('ID преподавателя не найден:', pd.professor_detail);
                            alert('Ошибка: ID преподавателя не найден');
                          }
                        }}
                      >
                        {pd.professor_detail
                          ? `${pd.professor_detail.last_name} ${pd.professor_detail.first_name} ${pd.professor_detail.third_name || ''}`
                          : 'Неизвестный преподаватель'}
                      </span>
                      <button
                        onClick={() => handleRemoveProfessor(pd.id)}
                        className="text-red-500 hover:text-red-700 cursor-pointer"
                      >
                        Удалить
                      </button>
                    </li>
                  ))
                ) : (
                  <li>Нет лекторов</li>
                )}
              </ul>
            </div>
            <div>
              <h3 className="text-black font-bold">Практики</h3>
              <ul>
                {practices.length > 0 ? (
                  practices.map((pd) => (
                    <li key={pd.id} className="border-b py-2 flex justify-between">
                      <span
                        className="hover:text-green-600 cursor-pointer"
                        onClick={() => {
                          console.log('Переход к преподавателю:', pd.professor_detail);
                          if (pd.professor_detail && pd.professor_detail.id) {
                            router.push(`/professors/${pd.professor_detail.id}`);
                          } else {
                            console.error('ID преподавателя не найден:', pd.professor_detail);
                            alert('Ошибка: ID преподавателя не найден');
                          }
                        }}
                      >
                        {pd.professor_detail
                          ? `${pd.professor_detail.last_name} ${pd.professor_detail.first_name} ${pd.professor_detail.third_name || ''}`
                          : 'Неизвестный преподаватель'}
                      </span>
                      <button
                        onClick={() => handleRemoveProfessor(pd.id)}
                        className="text-red-500 hover:text-red-700 cursor-pointer"
                      >
                        Удалить
                      </button>
                    </li>
                  ))
                ) : (
                  <li>Нет практиков</li>
                )}
              </ul>
            </div>
            <div>
              <h3 className="text-black font-bold">Лабораторные</h3>
              <ul>
                {labs.length > 0 ? (
                  labs.map((pd) => (
                    <li key={pd.id} className="border-b py-2 flex justify-between">
                      <span
                        className="hover:text-green-600 cursor-pointer"
                        onClick={() => {
                          console.log('Переход к преподавателю:', pd.professor_detail);
                          if (pd.professor_detail && pd.professor_detail.id) {
                            router.push(`/professors/${pd.professor_detail.id}`);
                          } else {
                            console.error('ID преподавателя не найден:', pd.professor_detail);
                            alert('Ошибка: ID преподавателя не найден');
                          }
                        }}
                      >
                        {pd.professor_detail
                          ? `${pd.professor_detail.last_name} ${pd.professor_detail.first_name} ${pd.professor_detail.third_name || ''}`
                          : 'Неизвестный преподаватель'}
                      </span>
                      <button
                        onClick={() => handleRemoveProfessor(pd.id)}
                        className="text-red-500 hover:text-red-700 cursor-pointer"
                      >
                        Удалить
                      </button>
                    </li>
                  ))
                ) : (
                  <li>Нет лаборантов</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisciplineDetail;