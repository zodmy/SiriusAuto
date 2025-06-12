'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface ProfileData {
  id: number;
  email: string;
  firstName: string;
  lastName?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProfilePage() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
        setFormData({
          firstName: data.firstName,
          lastName: data.lastName || '',
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        });
      } else {
        setError('Помилка завантаження профілю');
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      setError('Мережева помилка');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
    setSuccessMessage('');
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      return "Ім'я є обов'язковим";
    }

    if (formData.newPassword) {
      if (!formData.currentPassword) {
        return 'Введіть поточний пароль для зміни пароля';
      }

      if (formData.newPassword.length < 6) {
        return 'Новий пароль повинен містити принаймні 6 символів';
      }

      if (formData.newPassword !== formData.confirmNewPassword) {
        return 'Паролі не співпадають';
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setIsSubmitting(false);
      return;
    }

    try {
      const updateData: {
        firstName: string;
        lastName: string | null;
        currentPassword?: string;
        newPassword?: string;
      } = {
        firstName: formData.firstName,
        lastName: formData.lastName || null,
      };

      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        setProfileData(data);
        setFormData((prev) => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        }));
        setSuccessMessage('Профіль успішно оновлено');
        setIsEditing(false);
      } else {
        setError(data.error || 'Помилка оновлення профілю');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setError('Мережева помилка');
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  if (authLoading) {
    return <div className='min-h-screen bg-gray-50'></div>;
  }

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  if (isLoading) {
    return (
      <div className='flex flex-col min-h-screen bg-gray-50'>
        <Header />
        <div className='flex-grow flex items-center justify-center'>
          <div className='w-full max-w-2xl mx-auto'>
            <div className='bg-white shadow rounded-lg p-6'>
              <div className='h-6 w-1/3 bg-gray-200 rounded mb-6 animate-pulse'></div>
              <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 mb-6'>
                <div className='h-5 w-2/3 bg-gray-200 rounded animate-pulse'></div>
                <div className='h-5 w-2/3 bg-gray-200 rounded animate-pulse'></div>
              </div>
              <div className='h-5 w-1/2 bg-gray-200 rounded mb-4 animate-pulse'></div>
              <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
                <div className='h-5 w-2/3 bg-gray-200 rounded animate-pulse'></div>
                <div className='h-5 w-2/3 bg-gray-200 rounded animate-pulse'></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className='flex flex-col min-h-screen bg-gray-50'>
        <Header />
        <div className='flex-grow flex items-center justify-center'>
          <div className='text-center'>
            <p className='text-red-600'>Помилка завантаження профілю</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className='flex flex-col min-h-screen bg-gray-50'>
      <Header />
      <div className='flex-grow py-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-2xl mx-auto'>
          <div className='bg-white shadow rounded-lg'>
            <div className='px-6 py-4 border-b border-gray-200'>
              <div className='flex justify-between items-center'>
                <h1 className='text-2xl font-bold text-gray-900'>Особистий кабінет</h1>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer'>
                    Редагувати
                  </button>
                )}
              </div>
            </div>

            <div className='p-6'>
              {successMessage && (
                <div className='rounded-md bg-green-50 p-4 mb-6'>
                  <div className='flex'>
                    <div className='flex-shrink-0'>
                      <svg className='h-5 w-5 text-green-400' viewBox='0 0 20 20' fill='currentColor'>
                        <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                      </svg>
                    </div>
                    <div className='ml-3'>
                      <div className='text-sm text-green-800'>{successMessage}</div>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className='rounded-md bg-red-50 p-4 mb-6'>
                  <div className='flex'>
                    <div className='flex-shrink-0'>
                      <svg className='h-5 w-5 text-red-400' viewBox='0 0 20 20' fill='currentColor'>
                        <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z' clipRule='evenodd' />
                      </svg>
                    </div>
                    <div className='ml-3'>
                      <div className='text-sm text-red-800'>{error}</div>
                    </div>
                  </div>
                </div>
              )}

              {isEditing ? (
                <form onSubmit={handleSubmit} className='space-y-6'>
                  <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
                    <div>
                      <label htmlFor='firstName' className='block text-sm font-medium text-gray-700'>
                        {"Ім'я"} <span className='text-red-500'>*</span>
                      </label>
                      <div className='mt-1'>
                        <input id='firstName' name='firstName' type='text' required value={formData.firstName} onChange={handleInputChange} className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm' />
                      </div>
                    </div>

                    <div>
                      <label htmlFor='lastName' className='block text-sm font-medium text-gray-700'>
                        Прізвище
                      </label>
                      <div className='mt-1'>
                        <input id='lastName' name='lastName' type='text' value={formData.lastName} onChange={handleInputChange} className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm' />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor='email' className='block text-sm font-medium text-gray-700'>
                      Email адреса
                    </label>
                    <div className='mt-1'>
                      <input id='email' type='email' value={profileData.email} disabled className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm cursor-not-allowed' />
                      <p className='mt-1 text-xs text-gray-500'>Email адресу неможливо змінити</p>
                    </div>
                  </div>

                  <div className='border-t border-gray-200 pt-6'>
                    <h3 className='text-lg font-medium text-gray-900 mb-4'>Зміна пароля</h3>
                    <p className='text-sm text-gray-600 mb-4'>Залиште поля порожніми, якщо не хочете змінювати пароль</p>

                    <div className='space-y-4'>
                      <div>
                        <label htmlFor='currentPassword' className='block text-sm font-medium text-gray-700'>
                          Поточний пароль
                        </label>
                        <div className='mt-1 relative'>
                          <input id='currentPassword' name='currentPassword' type={showPasswords.current ? 'text' : 'password'} value={formData.currentPassword} onChange={handleInputChange} className='appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm' />
                          <button type='button' className='absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer' onClick={() => togglePasswordVisibility('current')}>
                            {showPasswords.current ? (
                              <svg className='h-5 w-5 text-gray-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.467 8.467m1.411 1.411l-1.411 1.411m4.242 4.242l1.411-1.411m-1.411 1.411l1.411 1.411' />
                              </svg>
                            ) : (
                              <svg className='h-5 w-5 text-gray-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label htmlFor='newPassword' className='block text-sm font-medium text-gray-700'>
                          Новий пароль
                        </label>
                        <div className='mt-1 relative'>
                          <input id='newPassword' name='newPassword' type={showPasswords.new ? 'text' : 'password'} value={formData.newPassword} onChange={handleInputChange} className='appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm' placeholder='Мін. 6 символів' />
                          <button type='button' className='absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer' onClick={() => togglePasswordVisibility('new')}>
                            {showPasswords.new ? (
                              <svg className='h-5 w-5 text-gray-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.467 8.467m1.411 1.411l-1.411 1.411m4.242 4.242l1.411-1.411m-1.411 1.411l1.411 1.411' />
                              </svg>
                            ) : (
                              <svg className='h-5 w-5 text-gray-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label htmlFor='confirmNewPassword' className='block text-sm font-medium text-gray-700'>
                          Підтвердіть новий пароль
                        </label>
                        <div className='mt-1 relative'>
                          <input id='confirmNewPassword' name='confirmNewPassword' type={showPasswords.confirm ? 'text' : 'password'} value={formData.confirmNewPassword} onChange={handleInputChange} className='appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm' />
                          <button type='button' className='absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer' onClick={() => togglePasswordVisibility('confirm')}>
                            {showPasswords.confirm ? (
                              <svg className='h-5 w-5 text-gray-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.467 8.467m1.411 1.411l-1.411 1.411m4.242 4.242l1.411-1.411m-1.411 1.411l1.411 1.411' />
                              </svg>
                            ) : (
                              <svg className='h-5 w-5 text-gray-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='flex justify-end space-x-3'>
                    <button
                      type='button'
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          firstName: profileData.firstName,
                          lastName: profileData.lastName || '',
                          currentPassword: '',
                          newPassword: '',
                          confirmNewPassword: '',
                        });
                        setError('');
                        setSuccessMessage('');
                      }}
                      className='bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer'
                    >
                      Скасувати
                    </button>
                    <button type='submit' disabled={isSubmitting} className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer'>
                      {isSubmitting ? 'Збереження...' : 'Зберегти зміни'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className='space-y-6'>
                  <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
                    <div>
                      <dt className='text-sm font-medium text-gray-500'>{"Ім'я"}</dt>
                      <dd className='mt-1 text-sm text-gray-900'>{profileData.firstName}</dd>
                    </div>
                    <div>
                      <dt className='text-sm font-medium text-gray-500'>Прізвище</dt>
                      <dd className='mt-1 text-sm text-gray-900'>{profileData.lastName || 'Не вказано'}</dd>
                    </div>
                  </div>

                  <div>
                    <dt className='text-sm font-medium text-gray-500'>Email адреса</dt>
                    <dd className='mt-1 text-sm text-gray-900'>{profileData.email}</dd>
                  </div>

                  <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
                    <div>
                      <dt className='text-sm font-medium text-gray-500'>Дата реєстрації</dt>
                      <dd className='mt-1 text-sm text-gray-900'>{new Date(profileData.createdAt).toLocaleDateString('uk-UA')}</dd>
                    </div>
                    <div>
                      <dt className='text-sm font-medium text-gray-500'>Останнє оновлення</dt>
                      <dd className='mt-1 text-sm text-gray-900'>{new Date(profileData.updatedAt).toLocaleDateString('uk-UA')}</dd>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
