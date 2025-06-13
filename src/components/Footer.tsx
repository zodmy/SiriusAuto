import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className='bg-gray-800 text-white'>
      <div className='max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8'>
        <div className='hidden md:flex md:justify-between md:items-center text-sm'>
          <div className='flex items-center space-x-6'>
            <div className='flex items-center'>
              <FaPhoneAlt className='h-5 w-5 text-blue-500 mr-2' />
              <a href='tel:+380671234567' className='text-gray-300 hover:underline focus:underline' aria-label='Зателефонувати'>
                +380 (67) 123-45-67
              </a>
            </div>
            <div className='flex items-center'>
              <FaEnvelope className='h-5 w-5 text-blue-500 mr-2' />
              <a href='mailto:sirius@auto.com' className='text-gray-300 hover:underline focus:underline' aria-label='Написати на email'>
                sirius@auto.com
              </a>
            </div>
            <div className='flex items-center'>
              <FaMapMarkerAlt className='h-5 w-5 text-blue-500 mr-2' />
              <a href='https://maps.app.goo.gl/LeKZppTaN4z5k5ea6' target='_blank' rel='noopener noreferrer' className='text-gray-300 hover:underline focus:underline' aria-label='Відкрити адресу на карті'>
                м. Харків, вул. Полтавський Шлях, 115
              </a>
            </div>
          </div>
          <div className='text-gray-400 text-sm'>© 2024 Sirius Auto. Всі права захищені.</div>
        </div>

        <div className='md:hidden space-y-4'>
          <div className='space-y-3'>
            <div className='flex items-center'>
              <FaPhoneAlt className='h-5 w-5 text-blue-500 mr-3 flex-shrink-0' />
              <a href='tel:+380671234567' className='text-gray-300 hover:underline focus:underline text-sm' aria-label='Зателефонувати'>
                +380 (67) 123-45-67
              </a>
            </div>
            <div className='flex items-center'>
              <FaEnvelope className='h-5 w-5 text-blue-500 mr-3 flex-shrink-0' />
              <a href='mailto:sirius@auto.com' className='text-gray-300 hover:underline focus:underline text-sm' aria-label='Написати на email'>
                sirius@auto.com
              </a>
            </div>
            <div className='flex items-start'>
              <FaMapMarkerAlt className='h-5 w-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5' />
              <a href='https://maps.app.goo.gl/LeKZppTaN4z5k5ea6' target='_blank' rel='noopener noreferrer' className='text-gray-300 hover:underline focus:underline text-sm leading-relaxed' aria-label='Відкрити адресу на карті'>
                м. Харків, вул. Полтавський Шлях, 115
              </a>
            </div>
          </div>
          <div className='border-t border-gray-700 pt-4'>
            <div className='text-gray-400 text-xs text-center'>© 2024 Sirius Auto. Всі права захищені.</div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
