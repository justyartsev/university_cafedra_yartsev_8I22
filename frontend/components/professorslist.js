import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddProfessor from './addprofessor';
import { useRouter } from 'next/router';

const ProfessorList = () => {
  const router = useRouter();
  const [professors, setProfessors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfessors = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/professors/');
      setProfessors(response.data);
      setError(null);
    } catch (error) {
      console.error('Ошибка загрузки преподавателей:', error);
      setError('Не удалось загрузить список преподавателей. Проверь сервер.');
    }
  };

  useEffect(() => {
    fetchProfessors();
  }, []);

  const filteredProfessors = professors.filter(professor =>
    `${professor.first_name} ${professor.last_name} ${professor.third_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const navigateTo = (path) => {
    router.push(path);
  };

  const isActive = (path) => router.pathname === path;

  const handleAddSuccess = () => {
    fetchProfessors(); // Обновляем список после успешного добавления
    setShowAddForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-200">
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 rounded border border-gray-300"
          />
          <span className="absolute right-2 top-2 text-gray-500">🔍</span>
        </div>
      </nav>

      {/* Список преподавателей */}
      <div className="p-4">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="text-black flex justify-between items-center mb-4">
          <div>
            Результаты поиска: {filteredProfessors.length}
            <select className="ml-4 p-2 border rounded cursor-pointer">
              <option>Выберите</option>
              <option>Выберите</option>
            </select>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-green-500 text-white p-2 rounded hover:bg-green-600 cursor-pointer"
          >
            Добавить
          </button>
        </div>

        {filteredProfessors.map((professor) => (
          <div
            key={professor.id}
            className="bg-white text-gray-700 p-4 mb-4 rounded-lg shadow flex items-center hover:bg-[#55A376] cursor-pointer"
            onClick={() => router.push(`/professors/${professor.id}`)}
          >
            <img src="https://via.placeholder.com/50" alt="Avatar" className="mr-4" />
            <div>
              <h3 className="text-lg font-bold text-[#0F9244]">
                {professor.last_name} {professor.first_name} {professor.third_name || ''}
              </h3>
              <p>Должность: {professor.position?.name || 'Не указана'}</p>
              <p>Кабинет: {professor.office?.number || 'Не указан'}</p>
              <p>Ставка: {professor.work_time?.name || 'Не указана'}</p>
            </div>
          </div>
        ))}

        {showAddForm && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg w-1/2">
              <AddProfessor onClose={() => setShowAddForm(false)} onSuccess={handleAddSuccess} />
              <button
                onClick={() => setShowAddForm(false)}
                className="mt-4 bg-red-500 text-white p-2 rounded hover:bg-red-600"
              >
                Закрыть
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessorList;