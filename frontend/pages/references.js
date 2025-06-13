import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const References = () => {
  const router = useRouter();
  const [sections, setSections] = useState({
    degrees: { open: true, data: [], editing: null },
    positions: { open: true, data: [], editing: null },
    offices: { open: true, data: [], editing: null },
    workTimes: { open: true, data: [], editing: null },
    activities: { open: true, data: [], editing: null },
  });
  const [newItem, setNewItem] = useState({ section: '', name: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [degrees, positions, offices, workTimes, activities] = await Promise.all([
          axios.get('http://localhost:8000/api/degrees/'),
          axios.get('http://localhost:8000/api/positions/'),
          axios.get('http://localhost:8000/api/offices/'),
          axios.get('http://localhost:8000/api/work-times/'),
          axios.get('http://localhost:8000/api/activities/'),
        ]);
        console.log('Загруженные данные:', { degrees: degrees.data, offices: offices.data, positions: positions.data, workTimes: workTimes.data, activities: activities.data });
        setSections({
          degrees: { ...sections.degrees, data: degrees.data },
          positions: { ...sections.positions, data: positions.data },
          offices: { ...sections.offices, data: offices.data },
          workTimes: { ...sections.workTimes, data: workTimes.data },
          activities: { ...sections.activities, data: activities.data },
        });
      } catch (error) {
        console.error('Ошибка загрузки справочников:', error.response ? error.response.data : error.message);
      }
    };
    fetchData();
  }, []);

  const toggleSection = (section) => {
    setSections((prev) => ({
      ...prev,
      [section]: { ...prev[section], open: !prev[section].open },
    }));
  };

  const handleAdd = (section) => {
    setNewItem({ section, name: '' });
  };

  const handleSaveNew = async (e) => {
    e.preventDefault();
    if (!newItem.name) {
      alert('Введите значение');
      return;
    }
    try {
      const endpoint = {
        degrees: 'http://localhost:8000/api/degrees/',
        positions: 'http://localhost:8000/api/positions/',
        offices: 'http://localhost:8000/api/offices/',
        workTimes: 'http://localhost:8000/api/work-times/',
        activities: 'http://localhost:8000/api/activities/',
      }[newItem.section];
      const dataToSend = {
        name: newItem.name, // Для degrees, positions, activities, workTimes
      };
      if (newItem.section === 'offices') {
        dataToSend.number = newItem.name; // Для offices используем number
      }
      await axios.post(endpoint, dataToSend, { headers: { 'Content-Type': 'application/json' } });
      const response = await axios.get(endpoint);
      setSections((prev) => ({
        ...prev,
        [newItem.section]: { ...prev[newItem.section], data: response.data, open: true },
      }));
      setNewItem({ section: '', name: '' });
      alert('Значение успешно добавлено');
    } catch (error) {
      console.error('Ошибка при добавлении:', error.response ? error.response.data : error.message);
      alert('Не удалось добавить значение');
    }
  };

  const handleEdit = (section, id, value) => {
    const editValue = section === 'offices' ? { id, number: value } : { id, name: value };
    setSections((prev) => ({
      ...prev,
      [section]: { ...prev[section], editing: editValue },
    }));
  };

  const handleSaveEdit = async (section, id) => {
    const editing = sections[section].editing;
    if ((section !== 'offices' && !editing.name) || (section === 'offices' && !editing.number)) {
      alert('Введите значение');
      return;
    }
    try {
      const endpoint = {
        degrees: `http://localhost:8000/api/degrees/${id}/`,
        positions: `http://localhost:8000/api/positions/${id}/`,
        offices: `http://localhost:8000/api/offices/${id}/`,
        workTimes: `http://localhost:8000/api/work-times/${id}/`,
        activities: `http://localhost:8000/api/activities/${id}/`,
      }[section];
      const dataToSend = {};
      if (section === 'offices') {
        dataToSend.number = editing.number; // Убеждаемся, что number передается как строка
      } else {
        dataToSend.name = editing.name; // Для остальных секций
      }
      console.log('Отправляемые данные для редактирования:', { endpoint, data: dataToSend });
      const response = await axios.put(endpoint, dataToSend, { headers: { 'Content-Type': 'application/json' } });
      console.log('Ответ сервера:', response.data);
      const newData = await axios.get({
        degrees: 'http://localhost:8000/api/degrees/',
        positions: 'http://localhost:8000/api/positions/',
        offices: 'http://localhost:8000/api/offices/',
        workTimes: 'http://localhost:8000/api/work-times/',
        activities: 'http://localhost:8000/api/activities/',
      }[section]);
      setSections((prev) => ({
        ...prev,
        [section]: { ...prev[section], data: newData.data, editing: null },
      }));
      alert('Значение успешно обновлено');
    } catch (error) {
      console.error('Ошибка при обновлении:', error.response ? error.response.data : error.message);
      alert('Не удалось обновить значение');
    }
  };

  const handleRemove = async (section, id) => {
    if (confirm('Вы уверены, что хотите удалить это значение?')) {
      try {
        const endpoint = {
          degrees: `http://localhost:8000/api/degrees/${id}/`,
          positions: `http://localhost:8000/api/positions/${id}/`,
          offices: `http://localhost:8000/api/offices/${id}/`,
          workTimes: `http://localhost:8000/api/work-times/${id}/`,
          activities: `http://localhost:8000/api/activities/${id}/`,
        }[section];
        await axios.delete(endpoint);
        const response = await axios.get({
          degrees: 'http://localhost:8000/api/degrees/',
          positions: 'http://localhost:8000/api/positions/',
          offices: 'http://localhost:8000/api/offices/',
          workTimes: 'http://localhost:8000/api/work-times/',
          activities: 'http://localhost:8000/api/activities/',
        }[section]);
        setSections((prev) => ({
          ...prev,
          [section]: { ...prev[section], data: response.data },
        }));
        alert('Значение успешно удалено');
      } catch (error) {
        console.error('Ошибка при удалении:', error.response ? error.response.data : error.message);
        alert('Не удалось удалить значение');
      }
    }
  };

  const navigateTo = (path) => {
    router.push(path);
  };

  const isActive = (path) => router.pathname === path || (path === '/references' && router.pathname === '/references');

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
        {Object.entries(sections).map(([section, { open, data, editing }]) => (
          <div key={section} className="bg-white rounded-lg shadow p-4 mb-4">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleSection(section)}
            >
              <h2 className="text-lg font-semibold text-green-600">
                {section === 'degrees' && 'Ученые степени'}
                {section === 'positions' && 'Должности'}
                {section === 'offices' && 'Кабинеты'}
                {section === 'workTimes' && 'Ставки'}
                {section === 'activities' && 'Дополнительные активности'}
              </h2>
              <button
                className="bg-green-500 text-white p-1 rounded hover:bg-green-600 cursor-pointer"
                onClick={(e) => { e.stopPropagation(); handleAdd(section); }}
              >
                Добавить
              </button>
            </div>
            {open && (
              <div className="text-gray-800 mt-2">
                {data.length > 0 ? (
                  <ul>
                    {data.map((item) => (
                      <li key={item.id} className="border-b py-2 flex justify-between items-center">
                        {editing && editing.id === item.id ? (
                          <input
                            type="text"
                            value={editing.name || (item.number || item.name)}
                            onChange={(e) => setSections((prev) => ({
                              ...prev,
                              [section]: { ...prev[section], editing: { ...prev[section].editing, name: e.target.value } },
                            }))}
                            className="p-1 border rounded w-full"
                          />
                        ) : (
                          <span>{item.number || item.name}</span>
                        )}
                        <div className="space-x-2">
                          {editing && editing.id === item.id ? (
                            <button
                              className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600 cursor-pointer"
                              onClick={() => handleSaveEdit(section, item.id)}
                            >
                              Сохранить
                            </button>
                          ) : (
                            <button
                              className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600 cursor-pointer"
                              onClick={() => handleEdit(section, item.id, item.name)}
                            >
                              Изменить
                            </button>
                          )}
                          <button
                            className="bg-red-500 text-white p-1 rounded hover:bg-red-600 cursor-pointer"
                            onClick={() => handleRemove(section, item.id)}
                          >
                            Удалить
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">Нет данных</p>
                )}
                {newItem.section === section && (
                  <form onSubmit={handleSaveNew} className="mt-2">
                    <input
                      type="text"
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      placeholder="Введите новое значение"
                      className="p-1 border rounded w-full"
                    />
                    <div className="flex space-x-2 mt-2">
                      <button
                        type="submit"
                        className="bg-green-500 text-white p-1 rounded hover:bg-green-600 cursor-pointer"
                      >
                        Добавить
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewItem({ section: '', name: '' })}
                        className="bg-gray-500 text-white p-1 rounded hover:bg-gray-600 cursor-pointer"
                      >
                        Отмена
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default References;