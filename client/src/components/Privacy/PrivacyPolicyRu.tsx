import React from 'react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicyRu = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-8">
      <div className="w-full max-w-4xl">
        <button
          onClick={() => navigate('/login')}
          className="mb-8 flex items-center text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Вернуться к входу
        </button>

        <h1 className="text-3xl font-bold mb-8">Политика конфиденциальности</h1>
        <div className="prose dark:prose-invert max-w-none">
          <p className="mb-4">Дата вступления в силу: 19 марта 2024 г.</p>

          <h2 className="text-xl font-semibold mt-6 mb-4">Введение</h2>
          <p>
            AiBuddy стремится защитить вашу конфиденциальность. Эта Политика конфиденциальности объясняет, как мы собираем,
            используем и защищаем вашу личную информацию при использовании нашего чат-приложения и связанных с ним услуг.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-4">Информация, которую мы собираем</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>Информация об аккаунте: Email адрес и данные аутентификации при создании аккаунта</li>
            <li>Данные чата: Сообщения и разговоры с нашим ИИ-ассистентом</li>
            <li>Информация об использовании: Как вы взаимодействуете с нашими услугами, включая используемые функции и время использования</li>
            <li>Технические данные: IP-адрес, тип браузера, информация об устройстве и файлы cookie</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-4">Как мы используем вашу информацию</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>Для предоставления и поддержки нашего чат-сервиса</li>
            <li>Для улучшения и персонализации вашего опыта</li>
            <li>Для анализа шаблонов использования и оптимизации нашего сервиса</li>
            <li>Для коммуникации с вами об обновлениях сервиса</li>
            <li>Для обеспечения безопасности и предотвращения злоупотреблений</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-4">Безопасность данных</h2>
          <p>
            Мы применяем соответствующие технические и организационные меры безопасности для защиты вашей личной информации
            от несанкционированного доступа, раскрытия или уничтожения.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-4">Ваши права</h2>
          <p>У вас есть право:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Получить доступ к вашим личным данным</li>
            <li>Исправить неточные данные</li>
            <li>Запросить удаление ваших данных</li>
            <li>Возражать против обработки ваших данных</li>
            <li>Экспортировать ваши данные</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-4">Свяжитесь с нами</h2>
          <p>
            Если у вас есть вопросы об этой Политике конфиденциальности или наших практиках, пожалуйста, свяжитесь с нами по адресу{' '}
            <a href="mailto:support@aibuddy.com" className="text-blue-500 hover:text-blue-600">
              support@aibuddy.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyRu; 