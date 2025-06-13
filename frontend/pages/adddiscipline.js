import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const AddDiscipline = ({ onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/api/disciplines/', { name });
      onSuccess();
      router.push(`/disciplines/${response.data.id}`);
    } catch (error) {
      console.error('Ошибка при добавлении дисциплины:', error);
      setError('Не удалось добавить дисциплину');
    }
  };

  return (
    <div>
      <h2 className="text-xl text-[#0F9244] font-bold mb-4">Добавить новую дисциплину</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Название дисциплины:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full text-gray-700 p-2 border rounded"
            required
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 cursor-pointer"
          >
            Добавить
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddDiscipline;