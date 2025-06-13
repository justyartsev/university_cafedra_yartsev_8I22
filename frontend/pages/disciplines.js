import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import AddDiscipline from './adddiscipline';

const DisciplineList = () => {
  const router = useRouter();
  const [disciplines, setDisciplines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchDisciplines = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/disciplines/');
      console.log('Полученные данные:', response.data); // Для отладки
      setDisciplines(response.data);
      setError(null);
    } catch (error) {
      console.error('Ошибка загрузки дисциплин:', error);
      setError('Не удалось загрузить список дисциплин. Проверь сервер.');
    }
  };

  useEffect(() => {
    fetchDisciplines();
  }, []);

  const filteredDisciplines = disciplines.filter(discipline =>
    discipline.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const navigateTo = (path) => {
    router.push(path);
  };

  const isActive = (path) => router.pathname === path;

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

      {/* Список дисциплин */}
      <div className="p-4">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="text-black flex justify-between items-center mb-4">
          <div>
            Результаты поиска: {filteredDisciplines.length}
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-green-500 text-white p-2 rounded hover:bg-green-600 cursor-pointer"
          >
            Добавить
          </button>
        </div>

        {filteredDisciplines.map((discipline) => (
          <div
            key={discipline.id}
            className="bg-white text-gray-700 p-4 mb-4 rounded-lg shadow flex items-center hover:bg-[#55A376] cursor-pointer"
            onClick={() => router.push(`/disciplines/${discipline.id}`)}
          >
            <div>
              <h3 className="text-lg font-bold text-[#0F9244]">
                {discipline.name}
              </h3>
            </div>
          </div>
        ))}
        {showAddForm && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg w-1/2">
              <AddDiscipline 
                onClose={() => setShowAddForm(false)} 
                onSuccess={() => {
                  // Обновляем список после успешного добавления
                  fetchDisciplines();
                }} 
              />
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


export default DisciplineList;