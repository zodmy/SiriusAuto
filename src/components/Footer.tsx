const Footer = () => {
  return (
    <footer className='bg-gray-800 text-white'>
      <div className='max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8'>
        {/* Desktop Layout */}
        <div className='hidden md:flex md:justify-between md:items-center text-sm'>
          <div className='flex items-center space-x-6'>
            <div className='flex items-center'>
              <svg className='h-5 w-5 text-blue-500 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24' aria-hidden='true'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
              </svg>
              <a href='tel:+380671234567' className='text-gray-300 hover:underline focus:underline' aria-label='Зателефонувати'>
                +380 (67) 123-45-67
              </a>
            </div>
            <div className='flex items-center'>
              <svg className='h-5 w-5 text-blue-500 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24' aria-hidden='true'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
              </svg>
              <a href='mailto:sirius@auto.com' className='text-gray-300 hover:underline focus:underline' aria-label='Написати на email'>
                sirius@auto.com
              </a>
            </div>
            <div className='flex items-center'>
              <svg className='h-5 w-5 text-blue-500 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24' aria-hidden='true'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
              </svg>
              <a href='https://maps.app.goo.gl/LeKZppTaN4z5k5ea6' target='_blank' rel='noopener noreferrer' className='text-gray-300 hover:underline focus:underline' aria-label='Відкрити адресу на карті'>
                м. Харків, вул. Полтавський Шлях, 115
              </a>
            </div>
          </div>
          <div className='text-gray-400 text-sm'>© 2024 Sirius Auto. Всі права захищені.</div>
        </div>

        {/* Mobile Layout */}
        <div className='md:hidden space-y-4'>
          <div className='space-y-3'>
            <div className='flex items-center'>
              <svg className='h-5 w-5 text-blue-500 mr-3 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24' aria-hidden='true'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
              </svg>
              <a href='tel:+380671234567' className='text-gray-300 hover:underline focus:underline text-sm' aria-label='Зателефонувати'>
                +380 (67) 123-45-67
              </a>
            </div>
            <div className='flex items-center'>
              <svg className='h-5 w-5 text-blue-500 mr-3 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24' aria-hidden='true'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
              </svg>
              <a href='mailto:sirius@auto.com' className='text-gray-300 hover:underline focus:underline text-sm' aria-label='Написати на email'>
                sirius@auto.com
              </a>
            </div>
            <div className='flex items-start'>
              <svg className='h-5 w-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5' fill='none' stroke='currentColor' viewBox='0 0 24 24' aria-hidden='true'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
              </svg>
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
