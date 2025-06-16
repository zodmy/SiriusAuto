import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const productImages = [
  '147451.webp',
  '2021-05-04_00-00-30_8713970.webp',
  '2022-06-05_21-30-43_13292159.webp',
  '2022-21-02_23-30-54_13243547.webp',
  '2022-22-06_16-31-13_13336576.webp',
  '2023-05-09_16-39-51_15287559.webp',
  '2023-05-09_18-40-57_15335671.webp',
  '2023-12-05_16-00-09_147227.jpg',
  '2023-22-07_21-36-24_14711888.jpg',
  '2023-22-07_21-36-25_14711889.webp',
  '2023-23-08_16-30-45_15153945.webp',
  '2023-25-08_18-00-31_15158679.webp',
  '2023-27-02_12-00-25_14402181.webp',
  '2023-29-11_12-31-04_15785204.webp',
  '2024-05-02_14-30-45_15880180.webp',
  '2024-14-11_10-00-25_17397252.webp',
  '2024-23-12_09-31-43_17459774.webp',
  '2024-26-04_17-30-51_16614523.webp',
  '2025-10-01_11-31-40_15293828.webp',
  '45__cCEJNOI.webp',
  '45__esVoJov.webp',
  '45__INQtp4L.webp',
  '45__iqA2JLI.webp',
  '45__jbmWD3S.jpg',
  '45__mITMHAU.webp',
  '45__mJZdCdT.webp',
  '45__OBzvUVN.webp',
  '45__PyuAJkm.webp',
  '45__sSqVR7r.webp',
  '45__ubyRKpn.webp',
  '45__Vyh8DP8.webp',
  '45__ZK58CDY.webp',
  '6856701_3136470_DtHmy5z.jpg',
  '7244436_12072969.webp',
  '7609798_10239076_lKQchXR.jpg',
  '7718873_57817715.webp',
  '7749561_11319725.webp',
  '7750289_24177638.webp',
  '7885238_1969127.webp'
]
let imageIndex = 0

function getNextProductImage() {
  const imageName = productImages[imageIndex % productImages.length]
  imageIndex++
  return `/images/products/${imageName}`
}

async function main() {
  console.log('🌱 Очищення бази даних...')

  await prisma.compatibility.deleteMany()
  await prisma.carEngine.deleteMany()
  await prisma.carBodyType.deleteMany()
  await prisma.carYear.deleteMany()
  await prisma.carModel.deleteMany()
  await prisma.carMake.deleteMany()
  await prisma.productOption.deleteMany()
  await prisma.review.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.manufacturer.deleteMany()

  console.log('🌱 Створення категорій...')

  await Promise.all([
    prisma.category.create({
      data: {
        name: 'Запчастини двигуна',
        children: {
          create: [
            { name: 'Фільтри' },
            { name: 'Свічки запалювання' },
            { name: 'Ремені та ланцюги ГРМ' },
            { name: 'Масла та рідини' },
            { name: 'Прокладки та сальники' },
            { name: 'Поршні та циліндри' },
            { name: 'Насоси водяні (помпи)' }
          ]
        }
      }
    }),
    prisma.category.create({
      data: {
        name: 'Гальмівна система',
        children: {
          create: [
            { name: 'Гальмівні колодки' },
            { name: 'Гальмівні диски' },
            { name: 'Гальмівна рідина' },
            { name: 'Гальмівні шланги' },
            { name: 'Суппорти та ремкомплекти' },
            { name: 'Гальмівні циліндри' }
          ]
        }
      }
    }),
    prisma.category.create({
      data: {
        name: 'Підвіска та рульове',
        children: {
          create: [
            { name: 'Амортизатори та стійки' },
            { name: 'Пружини підвіски' },
            { name: 'Важелі та сайлентблоки' },
            { name: 'Кульові опори' },
            { name: 'Рульові тяги та наконечники' },
            { name: 'Стабілізатори та втулки' }
          ]
        }
      }
    }),
    prisma.category.create({
      data: {
        name: 'Електрика та освітлення',
        children: {
          create: [
            { name: 'Акумулятори' },
            { name: 'Генератори та комплектуючі' },
            { name: 'Стартери та комплектуючі' },
            { name: 'Лампи автомобільні' },
            { name: 'Запобіжники та реле' },
            { name: 'Датчики' }
          ]
        }
      }
    }),
    prisma.category.create({
      data: {
        name: 'Кузовні деталі',
        children: {
          create: [
            { name: 'Фари та ліхтарі' },
            { name: 'Дзеркала та скла' },
            { name: 'Бампери та кріплення' },
            { name: 'Решітки радіатора та молдинги' },
            { name: 'Крила та підкрилки' }
          ]
        }
      }
    }),
    prisma.category.create({
      data: {
        name: 'Трансмісія',
        children: {
          create: [
            { name: 'Комплекти зчеплення' },
            { name: 'Маховики' },
            { name: 'Підшипники вижимні' },
            { name: 'ШРУСи та пильовики' },
            { name: 'Карданні вали' }
          ]
        }
      }
    }),
    prisma.category.create({
      data: {
        name: 'Система охолодження та опалення',
        children: {
          create: [
            { name: 'Радіатори охолодження' },
            { name: 'Термостати' },
            { name: 'Вентилятори радіатора' },
            { name: 'Радіатори пічки' }
          ]
        }
      }
    })
  ])

  console.log('🌱 Створення виробників...')

  const manufacturers = await Promise.all([
    prisma.manufacturer.create({ data: { name: 'Bosch' } }),
    prisma.manufacturer.create({ data: { name: 'Mann Filter' } }),
    prisma.manufacturer.create({ data: { name: 'NGK' } }),
    prisma.manufacturer.create({ data: { name: 'Gates' } }),
    prisma.manufacturer.create({ data: { name: 'Castrol' } }),
    prisma.manufacturer.create({ data: { name: 'Brembo' } }),
    prisma.manufacturer.create({ data: { name: 'Sachs' } }),
    prisma.manufacturer.create({ data: { name: 'Monroe' } }),
    prisma.manufacturer.create({ data: { name: 'Varta' } }),
    prisma.manufacturer.create({ data: { name: 'Hella' } }),
    prisma.manufacturer.create({ data: { name: 'Mobil 1' } }),
    prisma.manufacturer.create({ data: { name: 'Shell' } }),
    prisma.manufacturer.create({ data: { name: 'Denso' } }),
    prisma.manufacturer.create({ data: { name: 'Valeo' } }),
    prisma.manufacturer.create({ data: { name: 'Continental' } }),
    prisma.manufacturer.create({ data: { name: 'Febi Bilstein' } }),
    prisma.manufacturer.create({ data: { name: 'Lemförder' } }),
    prisma.manufacturer.create({ data: { name: 'SKF' } }),
    prisma.manufacturer.create({ data: { name: 'TRW' } }),
    prisma.manufacturer.create({ data: { name: 'Kayaba (KYB)' } })
  ])

  console.log('🌱 Створення марок автомобілів...')

  await Promise.all([
    prisma.carMake.create({
      data: {
        name: 'Toyota',
        models: {
          create: [
            {
              name: 'Camry',
              years: {
                create: [
                  {
                    year: 2018,
                    bodyTypes: { create: [{ name: 'Седан', engines: { create: [{ name: '2.0L I4' }, { name: '2.5L I4 Hybrid' }, { name: '3.5L V6' }] } }] }
                  },
                  {
                    year: 2019,
                    bodyTypes: { create: [{ name: 'Седан', engines: { create: [{ name: '2.0L I4' }, { name: '2.5L I4 Hybrid' }, { name: '3.5L V6' }] } }] }
                  },
                  {
                    year: 2020,
                    bodyTypes: { create: [{ name: 'Седан', engines: { create: [{ name: '2.0L I4' }, { name: '2.5L I4 Hybrid' }, { name: '3.5L V6' }] } }] }
                  }
                ]
              }
            },
            {
              name: 'RAV4',
              years: {
                create: [
                  { year: 2019, bodyTypes: { create: [{ name: 'SUV', engines: { create: [{ name: '2.0L I4' }, { name: '2.5L I4 Hybrid' }] } }] } },
                  { year: 2020, bodyTypes: { create: [{ name: 'SUV', engines: { create: [{ name: '2.0L I4' }, { name: '2.5L I4 Hybrid' }] } }] } }
                ]
              }
            },
            {
              name: 'Corolla',
              years: {
                create: [
                  { year: 2019, bodyTypes: { create: [{ name: 'Седан', engines: { create: [{ name: '1.8L I4' }, { name: '1.8L I4 Hybrid' }] } }] } },
                  { year: 2020, bodyTypes: { create: [{ name: 'Хетчбек', engines: { create: [{ name: '1.2L Turbo' }, { name: '2.0L Hybrid' }] } }] } }
                ]
              }
            }
          ]
        }
      }
    }),
    prisma.carMake.create({
      data: {
        name: 'BMW',
        models: {
          create: [
            {
              name: 'X5',
              years: {
                create: [
                  { year: 2018, bodyTypes: { create: [{ name: 'SUV', engines: { create: [{ name: '3.0L I6 Turbo' }, { name: '4.4L V8 Turbo' }] } }] } },
                  { year: 2019, bodyTypes: { create: [{ name: 'SUV', engines: { create: [{ name: '3.0L I6 Turbo' }, { name: '4.4L V8 Turbo' }, { name: 'M50d 3.0L I6 Quad-Turbo Diesel' }] } }] } }
                ]
              }
            },
            {
              name: '3 Series',
              years: {
                create: [
                  { year: 2019, bodyTypes: { create: [{ name: 'Седан', engines: { create: [{ name: '2.0L I4 Turbo' }, { name: '3.0L I6 Turbo' }] } }] } },
                  { year: 2020, bodyTypes: { create: [{ name: 'Універсал (Touring)', engines: { create: [{ name: '2.0L I4 Turbo Diesel' }, { name: '3.0L I6 Turbo' }] } }] } }
                ]
              }
            },
            {
              name: 'X3',
              years: {
                create: [
                  { year: 2019, bodyTypes: { create: [{ name: 'SUV', engines: { create: [{ name: '2.0L I4 Turbo' }, { name: '3.0L I6 Turbo' }] } }] } },
                  { year: 2020, bodyTypes: { create: [{ name: 'SUV', engines: { create: [{ name: 'xDrive30e 2.0L I4 PHEV' }, { name: 'M40i 3.0L I6 Turbo' }] } }] } }
                ]
              }
            }
          ]
        }
      }
    }),
    prisma.carMake.create({
      data: {
        name: 'Volkswagen',
        models: {
          create: [
            {
              name: 'Golf',
              years: {
                create: [
                  { year: 2018, bodyTypes: { create: [{ name: 'Хетчбек', engines: { create: [{ name: '1.4L TSI' }, { name: '2.0L TSI (GTI)' }] } }] } },
                  { year: 2019, bodyTypes: { create: [{ name: 'Універсал (Variant)', engines: { create: [{ name: '1.5L TSI' }, { name: '2.0L TDI' }] } }] } }
                ]
              }
            },
            {
              name: 'Passat',
              years: {
                create: [
                  { year: 2018, bodyTypes: { create: [{ name: 'Седан', engines: { create: [{ name: '1.8L TSI' }, { name: '2.0L TSI' }] } }] } },
                  { year: 2020, bodyTypes: { create: [{ name: 'Універсал (Alltrack)', engines: { create: [{ name: '2.0L TSI 4Motion' }] } }] } }
                ]
              }
            },
            {
              name: 'Tiguan',
              years: {
                create: [
                  { year: 2019, bodyTypes: { create: [{ name: 'SUV', engines: { create: [{ name: '1.4L TSI' }, { name: '2.0L TDI' }] } }] } },
                  { year: 2021, bodyTypes: { create: [{ name: 'SUV (Allspace)', engines: { create: [{ name: '2.0L TSI' }] } }] } }
                ]
              }
            }
          ]
        }
      }
    }),
    prisma.carMake.create({
      data: {
        name: 'Mercedes-Benz',
        models: {
          create: [
            {
              name: 'C-Class',
              years: {
                create: [
                  { year: 2019, bodyTypes: { create: [{ name: 'Седан', engines: { create: [{ name: 'C180 1.5L I4 Turbo' }, { name: 'C300 2.0L I4 Turbo' }] } }] } },
                  { year: 2020, bodyTypes: { create: [{ name: 'Купе', engines: { create: [{ name: 'C200 1.5L I4 EQ Boost' }, { name: 'AMG C43 3.0L V6 BiTurbo' }] } }] } }
                ]
              }
            },
            {
              name: 'GLE',
              years: {
                create: [
                  { year: 2020, bodyTypes: { create: [{ name: 'SUV', engines: { create: [{ name: 'GLE 300d 2.0L I4 Diesel' }, { name: 'GLE 450 3.0L I6 Turbo EQ Boost' }] } }] } }
                ]
              }
            },
            {
              name: 'A-Class',
              years: {
                create: [
                  { year: 2019, bodyTypes: { create: [{ name: 'Хетчбек', engines: { create: [{ name: 'A180 1.33L I4 Turbo' }, { name: 'A250 2.0L I4 Turbo' }] } }] } }
                ]
              }
            }
          ]
        }
      }
    }),
    prisma.carMake.create({
      data: {
        name: 'Audi',
        models: {
          create: [
            {
              name: 'A4',
              years: {
                create: [
                  { year: 2018, bodyTypes: { create: [{ name: 'Седан', engines: { create: [{ name: '2.0L TFSI' }, { name: '3.0L TDI' }] } }] } },
                  { year: 2020, bodyTypes: { create: [{ name: 'Універсал (Avant)', engines: { create: [{ name: '40 TFSI 2.0L' }, { name: '45 TFSI quattro 2.0L' }] } }] } }
                ]
              }
            },
            {
              name: 'Q5',
              years: {
                create: [
                  { year: 2019, bodyTypes: { create: [{ name: 'SUV', engines: { create: [{ name: '2.0L TFSI' }, { name: '3.0L TDI' }] } }] } },
                  { year: 2021, bodyTypes: { create: [{ name: 'Sportback', engines: { create: [{ name: '45 TFSI quattro 2.0L' }, { name: '50 TDI quattro 3.0L' }] } }] } }
                ]
              }
            },
            {
              name: 'A6',
              years: {
                create: [
                  { year: 2019, bodyTypes: { create: [{ name: 'Седан', engines: { create: [{ name: '45 TFSI 2.0L' }, { name: '55 TFSI 3.0L V6' }] } }] } }
                ]
              }
            }
          ]
        }
      }
    }),
    prisma.carMake.create({
      data: {
        name: 'Ford',
        models: {
          create: [
            {
              name: 'Focus',
              years: {
                create: [
                  { year: 2018, bodyTypes: { create: [{ name: 'Хетчбек', engines: { create: [{ name: '1.0L EcoBoost' }, { name: '1.5L TDCi Diesel' }] } }] } },
                  { year: 2020, bodyTypes: { create: [{ name: 'Універсал', engines: { create: [{ name: '1.5L EcoBoost' }, { name: '2.0L EcoBlue Diesel' }] } }] } }
                ]
              }
            },
            {
              name: 'Kuga',
              years: {
                create: [
                  { year: 2019, bodyTypes: { create: [{ name: 'SUV', engines: { create: [{ name: '1.5L EcoBoost' }, { name: '2.0L TDCi Diesel' }] } }] } },
                  { year: 2021, bodyTypes: { create: [{ name: 'SUV', engines: { create: [{ name: '2.5L FHEV (Hybrid)' }, { name: '1.5L EcoBlue Diesel' }] } }] } }
                ]
              }
            }
          ]
        }
      }
    }),
    prisma.carMake.create({
      data: {
        name: 'Skoda',
        models: {
          create: [
            {
              name: 'Octavia',
              years: {
                create: [
                  { year: 2018, bodyTypes: { create: [{ name: 'Ліфтбек', engines: { create: [{ name: '1.4L TSI' }, { name: '2.0L TDI' }] } }] } },
                  { year: 2020, bodyTypes: { create: [{ name: 'Універсал (Combi)', engines: { create: [{ name: '1.5L TSI e-TEC (Mild Hybrid)' }, { name: '2.0L TDI Evo' }] } }] } }
                ]
              }
            },
            {
              name: 'Kodiaq',
              years: {
                create: [
                  { year: 2019, bodyTypes: { create: [{ name: 'SUV', engines: { create: [{ name: '1.5L TSI' }, { name: '2.0L TDI 4x4' }] } }] } },
                  { year: 2021, bodyTypes: { create: [{ name: 'SUV (RS)', engines: { create: [{ name: '2.0L TSI 245hp' }] } }] } }
                ]
              }
            }
          ]
        }
      }
    }),
    prisma.carMake.create({
      data: {
        name: 'Honda',
        models: {
          create: [
            {
              name: 'Civic',
              years: {
                create: [
                  { year: 2018, bodyTypes: { create: [{ name: 'Седан', engines: { create: [{ name: '1.5L VTEC Turbo' }, { name: '2.0L i-VTEC' }] } }] } },
                  { year: 2019, bodyTypes: { create: [{ name: 'Хетчбек', engines: { create: [{ name: '1.0L VTEC Turbo' }, { name: '1.6L i-DTEC Diesel' }] } }] } },
                  { year: 2020, bodyTypes: { create: [{ name: 'Универсал', engines: { create: [{ name: '1.5L VTEC Turbo' }] } }] } }
                ]
              }
            },
            {
              name: 'CR-V',
              years: {
                create: [
                  { year: 2018, bodyTypes: { create: [{ name: 'SUV', engines: { create: [{ name: '1.5L VTEC Turbo' }, { name: '2.0L i-MMD Hybrid' }] } }] } },
                  { year: 2019, bodyTypes: { create: [{ name: 'SUV', engines: { create: [{ name: '1.5L VTEC Turbo AWD' }, { name: '2.0L i-MMD Hybrid AWD' }] } }] } }
                ]
              }
            },
            {
              name: 'Accord',
              years: {
                create: [
                  { year: 2019, bodyTypes: { create: [{ name: 'Седан', engines: { create: [{ name: '1.5L VTEC Turbo' }, { name: '2.0L i-VTEC Hybrid' }] } }] } }
                ]
              }
            }
          ]
        }
      }
    }),
    prisma.carMake.create({
      data: {
        name: 'Hyundai',
        models: {
          create: [
            {
              name: 'Elantra',
              years: {
                create: [
                  { year: 2018, bodyTypes: { create: [{ name: 'Седан', engines: { create: [{ name: '1.6L GDI' }, { name: '2.0L Nu GDI' }] } }] } },
                  { year: 2020, bodyTypes: { create: [{ name: 'Седан', engines: { create: [{ name: '1.6L Turbo GDI' }, { name: '2.0L GDI CVT' }] } }] } }
                ]
              }
            },
            {
              name: 'Tucson',
              years: {
                create: [
                  { year: 2019, bodyTypes: { create: [{ name: 'SUV', engines: { create: [{ name: '1.6L T-GDI' }, { name: '2.0L CRDI Diesel' }] } }] } },
                  { year: 2021, bodyTypes: { create: [{ name: 'SUV', engines: { create: [{ name: '1.6L T-GDI Hybrid' }, { name: '2.5L GDI' }] } }] } }
                ]
              }
            },
            {
              name: 'i30',
              years: {
                create: [
                  { year: 2018, bodyTypes: { create: [{ name: 'Хетчбек', engines: { create: [{ name: '1.4L T-GDI' }, { name: '1.6L CRDI' }] } }] } }
                ]
              }
            }
          ]
        }
      }
    }),
    prisma.carMake.create({
      data: {
        name: 'Kia',
        models: {
          create: [
            {
              name: 'Ceed',
              years: {
                create: [
                  { year: 2018, bodyTypes: { create: [{ name: 'Хетчбек', engines: { create: [{ name: '1.0L T-GDI' }, { name: '1.6L CRDI' }] } }] } },
                  { year: 2019, bodyTypes: { create: [{ name: 'Универсал', engines: { create: [{ name: '1.4L T-GDI' }, { name: '1.6L CRDI' }] } }] } }
                ]
              }
            },
            {
              name: 'Sportage',
              years: {
                create: [
                  { year: 2019, bodyTypes: { create: [{ name: 'SUV', engines: { create: [{ name: '1.6L T-GDI' }, { name: '2.0L CRDI' }] } }] } },
                  { year: 2021, bodyTypes: { create: [{ name: 'SUV', engines: { create: [{ name: '1.6L T-GDI Hybrid' }, { name: '2.0L CRDI AWD' }] } }] } }
                ]
              }
            }
          ]
        }
      }
    }),
    prisma.carMake.create({
      data: {
        name: 'Nissan',
        models: {
          create: [
            {
              name: 'Qashqai',
              years: {
                create: [
                  { year: 2018, bodyTypes: { create: [{ name: 'SUV', engines: { create: [{ name: '1.2L DIG-T' }, { name: '1.5L dCi Diesel' }] } }] } },
                  { year: 2021, bodyTypes: { create: [{ name: 'SUV', engines: { create: [{ name: '1.3L DIG-T' }, { name: 'e-POWER 1.5L Hybrid' }] } }] } }
                ]
              }
            },
            {
              name: 'X-Trail',
              years: {
                create: [
                  { year: 2019, bodyTypes: { create: [{ name: 'SUV', engines: { create: [{ name: '1.3L DIG-T' }, { name: '1.7L dCi Diesel' }] } }] } }
                ]
              }
            },
            {
              name: 'Micra',
              years: {
                create: [
                  { year: 2018, bodyTypes: { create: [{ name: 'Хетчбек', engines: { create: [{ name: '0.9L IG-T' }, { name: '1.5L dCi' }] } }] } }
                ]
              }
            }
          ]
        }
      }
    }),
    prisma.carMake.create({
      data: {
        name: 'Peugeot',
        models: {
          create: [
            {
              name: '308',
              years: {
                create: [
                  { year: 2018, bodyTypes: { create: [{ name: 'Хетчбек', engines: { create: [{ name: '1.2L PureTech' }, { name: '1.5L BlueHDi' }] } }] } },
                  { year: 2021, bodyTypes: { create: [{ name: 'Универсал', engines: { create: [{ name: '1.2L PureTech' }, { name: '1.5L BlueHDi' }] } }] } }
                ]
              }
            },
            {
              name: '3008',
              years: {
                create: [
                  { year: 2019, bodyTypes: { create: [{ name: 'SUV', engines: { create: [{ name: '1.2L PureTech' }, { name: '1.6L PureTech' }] } }] } }
                ]
              }
            },
            {
              name: '508',
              years: {
                create: [
                  { year: 2019, bodyTypes: { create: [{ name: 'Седан', engines: { create: [{ name: '1.6L PureTech' }, { name: '2.0L BlueHDi' }] } }] } }
                ]
              }
            }
          ]
        }
      }
    }),
    prisma.carMake.create({
      data: {
        name: 'Renault',
        models: {
          create: [
            {
              name: 'Clio',
              years: {
                create: [
                  { year: 2018, bodyTypes: { create: [{ name: 'Хетчбек', engines: { create: [{ name: '0.9L TCe' }, { name: '1.5L dCi' }] } }] } },
                  { year: 2020, bodyTypes: { create: [{ name: 'Хетчбек', engines: { create: [{ name: '1.0L TCe' }, { name: '1.3L TCe' }] } }] } }
                ]
              }
            },
            {
              name: 'Megane',
              years: {
                create: [
                  { year: 2018, bodyTypes: { create: [{ name: 'Хетчбек', engines: { create: [{ name: '1.2L TCe' }, { name: '1.5L dCi' }] } }] } },
                  { year: 2019, bodyTypes: { create: [{ name: 'Универсал', engines: { create: [{ name: '1.3L TCe' }, { name: '1.5L Blue dCi' }] } }] } }
                ]
              }
            },
            {
              name: 'Kadjar',
              years: {
                create: [
                  { year: 2019, bodyTypes: { create: [{ name: 'SUV', engines: { create: [{ name: '1.3L TCe' }, { name: '1.5L Blue dCi' }] } }] } }
                ]
              }
            }
          ]
        }
      }
    }),
    prisma.carMake.create({
      data: {
        name: 'Opel',
        models: {
          create: [
            {
              name: 'Astra',
              years: {
                create: [
                  { year: 2018, bodyTypes: { create: [{ name: 'Хетчбек', engines: { create: [{ name: '1.0L Turbo' }, { name: '1.6L CDTI' }] } }] } },
                  { year: 2020, bodyTypes: { create: [{ name: 'Универсал', engines: { create: [{ name: '1.2L Turbo' }, { name: '1.5L Diesel' }] } }] } }
                ]
              }
            },
            {
              name: 'Crossland X',
              years: {
                create: [
                  { year: 2019, bodyTypes: { create: [{ name: 'SUV', engines: { create: [{ name: '1.2L Turbo' }, { name: '1.5L Diesel' }] } }] } }
                ]
              }
            }
          ]
        }
      }
    })
  ])

  const filterCategory = await prisma.category.findFirst({ where: { name: 'Фільтри' } })
  const sparkPlugsCategory = await prisma.category.findFirst({ where: { name: 'Свічки запалювання' } })
  const brakePadsCategory = await prisma.category.findFirst({ where: { name: 'Гальмівні колодки' } })
  const brakeDiscsCategory = await prisma.category.findFirst({ where: { name: 'Гальмівні диски' } })
  const oilCategory = await prisma.category.findFirst({ where: { name: 'Масла та рідини' } })
  const batteryCategory = await prisma.category.findFirst({ where: { name: 'Акумулятори' } })
  const shockAbsorberCategory = await prisma.category.findFirst({ where: { name: 'Амортизатори та стійки' } })
  const beltsCategory = await prisma.category.findFirst({ where: { name: 'Ремені та ланцюги ГРМ' } })
  const lampsCategory = await prisma.category.findFirst({ where: { name: 'Лампи автомобільні' } })
  const waterPumpsCategory = await prisma.category.findFirst({ where: { name: 'Насоси водяні (помпи)' } })
  const gasketCategory = await prisma.category.findFirst({ where: { name: 'Прокладки та сальники' } })
  const thermostatCategory = await prisma.category.findFirst({ where: { name: 'Термостати' } })
  const generatorCategory = await prisma.category.findFirst({ where: { name: 'Генератори та комплектуючі' } })
  const clutchCategory = await prisma.category.findFirst({ where: { name: 'Комплекти зчеплення' } })

  console.log('🌱 Створення товарів...')

  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Повітряний фільтр Bosch S0123',
        description: 'Високоякісний повітряний фільтр для більшості японських автомобілів. Забезпечує оптимальну фільтрацію повітря та захист двигуна.',
        price: 850.00,
        stockQuantity: 25,
        imageUrl: getNextProductImage(),
        categoryId: filterCategory!.id,
        manufacturerId: manufacturers.find(m => m.name === 'Bosch')!.id,
        isVariant: false,
        productOptions: { create: [{ name: 'Матеріал', value: 'Паперовий' }, { name: 'Форма', value: 'Прямокутна' }, { name: 'Розмір', value: '280x215x58 мм' }] }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Масляний фільтр Mann W 712/75',
        description: 'Оригінальний масляний фільтр німецького виробництва. Відмінна якість фільтрації та довговічність.',
        price: 320.00,
        stockQuantity: 50,
        imageUrl: getNextProductImage(),
        categoryId: filterCategory!.id,
        manufacturerId: manufacturers.find(m => m.name === 'Mann Filter')!.id,
        isVariant: false,
        productOptions: { create: [{ name: 'Тип', value: 'Накручувальний' }, { name: 'Діаметр', value: '76 мм' }, { name: 'Висота', value: '79 мм' }] }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Паливний фільтр Bosch F 026 402 067',
        description: 'Надійний паливний фільтр для очищення палива від забруднень та води.',
        price: 450.00,
        stockQuantity: 30,
        imageUrl: getNextProductImage(),
        categoryId: filterCategory!.id,
        manufacturerId: manufacturers.find(m => m.name === 'Bosch')!.id,
        isVariant: false,
        productOptions: { create: [{ name: 'Тип', value: 'Лінійний' }, { name: 'Підключення', value: 'Push-in' }] }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Свічка запалювання NGK BKR6E-11',
        description: 'Стандартна свічка запалювання з нікелевим електродом. Забезпечує стабільне запалювання.',
        price: 180.00,
        stockQuantity: 100,
        imageUrl: getNextProductImage(),
        categoryId: sparkPlugsCategory!.id,
        manufacturerId: manufacturers.find(m => m.name === 'NGK')!.id,
        isVariant: false,
        productOptions: { create: [{ name: 'Зазор', value: '1.1 мм' }, { name: 'Різьба', value: 'M14x1.25' }, { name: 'Довжина різьби', value: '19 мм' }] }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Свічка запалювання Denso IK20TT',
        description: 'Іридієва свічка запалювання преміум класу для підвищеної продуктивності.',
        price: 380.00,
        stockQuantity: 60,
        imageUrl: getNextProductImage(),
        categoryId: sparkPlugsCategory!.id,
        manufacturerId: manufacturers.find(m => m.name === 'Denso')!.id,
        isVariant: false,
        productOptions: { create: [{ name: 'Матеріал електрода', value: 'Іридій' }, { name: 'Зазор', value: '0.8 мм' }, { name: 'Різьба', value: 'M14x1.25' }] }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Гальмівні колодки Brembo P 83 140',
        description: 'Передні гальмівні колодки для європейських автомобілів. Відмінне гальмування та довговічність.',
        price: 2800.00,
        stockQuantity: 15,
        imageUrl: getNextProductImage(),
        categoryId: brakePadsCategory!.id,
        manufacturerId: manufacturers.find(m => m.name === 'Brembo')!.id,
        isVariant: false,
        productOptions: { create: [{ name: 'Положення', value: 'Передня вісь' }, { name: 'Товщина', value: '17.5 мм' }, { name: 'Ширина', value: '131.4 мм' }] }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Гальмівні колодки TRW GDB1515',
        description: 'Задні гальмівні колодки з низьким рівнем пилу та шуму.',
        price: 1950.00,
        stockQuantity: 22,
        imageUrl: getNextProductImage(),
        categoryId: brakePadsCategory!.id,
        manufacturerId: manufacturers.find(m => m.name === 'TRW')!.id,
        isVariant: false,
        productOptions: { create: [{ name: 'Положення', value: 'Задня вісь' }, { name: 'Матеріал', value: 'Органічні' }, { name: 'Датчик зносу', value: 'Присутній' }] }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Моторна олива Castrol GTX 5W-30',
        description: 'Напівсинтетична моторна олива для бензинових двигунів. Забезпечує надійний захист двигуна.',
        price: 1600.00,
        stockQuantity: 40,
        imageUrl: getNextProductImage(),
        categoryId: oilCategory!.id,
        manufacturerId: manufacturers.find(m => m.name === 'Castrol')!.id,
        isVariant: false,
        variants: {
          create: [
            {
              name: 'Моторна олива Castrol GTX 5W-30 (1L)',
              description: 'Напівсинтетична моторна олива для бензинових двигунів - 1 літр',
              price: 350.00,
              stockQuantity: 80,
              imageUrl: getNextProductImage(),
              categoryId: oilCategory!.id,
              manufacturerId: manufacturers.find(m => m.name === 'Castrol')!.id,
              isVariant: true,
              productOptions: { create: [{ name: "Об'єм", value: '1 літр' }] }
            },
            {
              name: 'Моторна олива Castrol GTX 5W-30 (5L)',
              description: 'Напівсинтетична моторна олива для бензинових двигунів - 5 літрів',
              price: 1600.00,
              stockQuantity: 40,
              imageUrl: getNextProductImage(),
              categoryId: oilCategory!.id,
              manufacturerId: manufacturers.find(m => m.name === 'Castrol')!.id,
              isVariant: true,
              productOptions: { create: [{ name: "Об'єм", value: '5 літрів' }] }
            }
          ]
        },
        productOptions: { create: [{ name: "В'язкість", value: '5W-30' }, { name: 'Тип', value: 'Напівсинтетична' }, { name: 'Специфікація', value: 'API SN/CF' }] }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Моторна олива Shell Helix Ultra 5W-40',
        description: 'Повністю синтетична моторна олива для максимального захисту сучасних двигунів.',
        price: 1800.00,
        stockQuantity: 30,
        imageUrl: getNextProductImage(),
        categoryId: oilCategory!.id,
        manufacturerId: manufacturers.find(m => m.name === 'Shell')!.id,
        isVariant: false,
        productOptions: { create: [{ name: "В'язкість", value: '5W-40' }, { name: 'Тип', value: 'Повністю синтетична' }, { name: "Об'єм", value: '4 літри' }, { name: 'Специфікація', value: 'API SP, ACEA A3/B4' }] }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Акумулятор Varta Blue Dynamic E11',
        description: 'Надійний автомобільний акумулятор з високою пусковою потужністю.',
        price: 3200.00,
        stockQuantity: 12,
        imageUrl: getNextProductImage(),
        categoryId: batteryCategory!.id,
        manufacturerId: manufacturers.find(m => m.name === 'Varta')!.id,
        isVariant: false,
        productOptions: { create: [{ name: 'Ємність', value: '74 Ah' }, { name: 'Пусковий струм', value: '680 A' }, { name: 'Полярність', value: 'Пряма (R+)' }] }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Акумулятор Bosch S4 008',
        description: 'Автомобільний акумулятор Bosch S4 Silver, 70Ah, 630A, R+.',
        price: 2900.00,
        stockQuantity: 18,
        imageUrl: getNextProductImage(),
        categoryId: batteryCategory!.id,
        manufacturerId: manufacturers.find(m => m.name === 'Bosch')!.id,
        isVariant: false,
        productOptions: { create: [{ name: 'Ємність', value: '70 Ah' }, { name: 'Пусковий струм', value: '630 A' }, { name: 'Полярність', value: 'Пряма (R+)' }, { name: 'Технологія', value: 'Silver' }] }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Амортизатор Monroe G7423 OESpectrum',
        description: 'Передній амортизатор газовий для комфортної їзди та стабільності.',
        price: 1850.00,
        stockQuantity: 18,
        imageUrl: getNextProductImage(),
        categoryId: shockAbsorberCategory!.id,
        manufacturerId: manufacturers.find(m => m.name === 'Monroe')!.id,
        isVariant: false,
        productOptions: { create: [{ name: 'Тип', value: 'Газовий (двотрубний)' }, { name: 'Положення', value: 'Передня вісь' }, { name: 'Серія', value: 'OESpectrum' }] }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Амортизатор Kayaba Excel-G 334833',
        description: 'Задній газовий амортизатор для покращеної керованості.',
        price: 1750.00,
        stockQuantity: 25,
        imageUrl: getNextProductImage(),
        categoryId: shockAbsorberCategory!.id,
        manufacturerId: manufacturers.find(m => m.name === 'Kayaba (KYB)')!.id,
        isVariant: false,
        productOptions: { create: [{ name: 'Тип', value: 'Газовий (двотрубний)' }, { name: 'Положення', value: 'Задня вісь' }, { name: 'Серія', value: 'Excel-G' }] }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Ремінь ГРМ Gates K015501XS',
        description: 'Комплект ременя ГРМ з роликами для надійної роботи двигуна.',
        price: 2200.00,
        stockQuantity: 15,
        imageUrl: getNextProductImage(),
        categoryId: beltsCategory!.id,
        manufacturerId: manufacturers.find(m => m.name === 'Gates')!.id,
        isVariant: false,
        productOptions: { create: [{ name: 'Тип', value: 'Комплект (ремінь + ролики)' }, { name: 'Кількість зубів', value: '137' }, { name: 'Ширина', value: '25 мм' }] }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Лампа H7 Philips Vision +30%',
        description: 'Галогенна лампа H7, що забезпечує на 30% більше світла.',
        price: 250.00,
        stockQuantity: 50,
        imageUrl: getNextProductImage(),
        categoryId: lampsCategory!.id,
        manufacturerId: manufacturers.find(m => m.name === 'Hella')!.id,
        isVariant: false,
        productOptions: { create: [{ name: 'Цоколь', value: 'H7' }, { name: 'Тип', value: 'Галогенна' }, { name: 'Потужність', value: '55W' }, { name: 'Напруга', value: '12V' }] }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Лампа LED H4 Osram Night Breaker',
        description: 'Світлодіодна лампа H4 для головного світла, яскраве біле світло.',
        price: 1200.00,
        stockQuantity: 30,
        imageUrl: getNextProductImage(),
        categoryId: lampsCategory!.id,
        manufacturerId: manufacturers.find(m => m.name === 'Bosch')!.id,
        isVariant: false, productOptions: { create: [{ name: 'Цоколь', value: 'H4' }, { name: 'Тип', value: 'LED' }, { name: 'Колірна температура', value: '6000K' }, { name: 'Напруга', value: '12V/24V' }] }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Гальмівний диск Brembo 09.5844.11',
        description: 'Передній гальмівний диск для європейських автомобілів. Високоякісний чавун.',
        price: 1850.00,
        stockQuantity: 20,
        imageUrl: getNextProductImage(),
        categoryId: brakeDiscsCategory!.id,
        manufacturerId: manufacturers.find(m => m.name === 'Brembo')!.id,
        isVariant: false,
        productOptions: { create: [{ name: 'Діаметр', value: '280 мм' }, { name: 'Товщина', value: '22 мм' }, { name: 'Положення', value: 'Передня вісь' }, { name: 'Тип', value: 'Вентильований' }] }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Гальмівний диск TRW DF4823',
        description: 'Задній гальмівний диск, суцільний, для легкових автомобілів.',
        price: 980.00,
        stockQuantity: 35,
        imageUrl: getNextProductImage(),
        categoryId: brakeDiscsCategory!.id,
        manufacturerId: manufacturers.find(m => m.name === 'TRW')!.id,
        isVariant: false,
        productOptions: { create: [{ name: 'Діаметр', value: '240 мм' }, { name: 'Товщина', value: '9 мм' }, { name: 'Положення', value: 'Задня вісь' }, { name: 'Тип', value: 'Суцільний' }] }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Водяна помпа Gates WP0031',
        description: 'Надійна водяна помпа для системи охолодження двигуна.',
        price: 2200.00,
        stockQuantity: 18,
        imageUrl: getNextProductImage(),
        categoryId: waterPumpsCategory!.id,
        manufacturerId: manufacturers.find(m => m.name === 'Gates')!.id,
        isVariant: false,
        productOptions: { create: [{ name: 'Матеріал корпусу', value: 'Алюміній' }, { name: 'Тип кріплення', value: 'Фланцевий' }, { name: 'Привід', value: 'Ремінь ГРМ' }] }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Водяна помпа Bosch 1987946504',
        description: 'Оригінальна водяна помпа Bosch з підшипником високої якості.',
        price: 1950.00,
        stockQuantity: 25,
        imageUrl: getNextProductImage(),
        categoryId: waterPumpsCategory!.id,
        manufacturerId: manufacturers.find(m => m.name === 'Bosch')!.id,
        isVariant: false,
        productOptions: { create: [{ name: 'Матеріал', value: 'Чавун з алюмінієвим корпусом' }, { name: 'Гарантія', value: '24 місяці' }] }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Прокладка головки блоку Febi 26677',
        description: 'Металева прокладка головки блоку циліндрів з покриттям.',
        price: 1200.00,
        stockQuantity: 15,
        imageUrl: getNextProductImage(),
        categoryId: gasketCategory!.id,
        manufacturerId: manufacturers.find(m => m.name === 'Febi Bilstein')!.id,
        isVariant: false,
        productOptions: { create: [{ name: 'Матеріал', value: 'Сталь з графітовим покриттям' }, { name: 'Товщина', value: '1.2 мм' }] }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Комплект прокладок двигуна Victor Reinz 01-36290-01',
        description: 'Повний комплект прокладок для капітального ремонту двигуна.',
        price: 3500.00,
        stockQuantity: 8,
        imageUrl: getNextProductImage(),
        categoryId: gasketCategory!.id,
        manufacturerId: manufacturers.find(m => m.name === 'Febi Bilstein')!.id,
        isVariant: false,
        productOptions: { create: [{ name: 'Комплектність', value: 'Повний комплект' }, { name: 'Матеріал', value: 'Різні матеріали' }] }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Термостат Gates TH33882G1',
        description: 'Термостат системи охолодження з корпусом та ущільненням.',
        price: 850.00,
        stockQuantity: 40,
        imageUrl: getNextProductImage(),
        categoryId: thermostatCategory!.id,
        manufacturerId: manufacturers.find(m => m.name === 'Gates')!.id,
        isVariant: false,
        productOptions: { create: [{ name: 'Температура спрацювання', value: '87°C' }, { name: 'Комплектація', value: 'З корпусом' }] }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Термостат Wahler 4247.87D',
        description: 'Німецький термостат преміум класу для точного контролю температури.',
        price: 650.00,
        stockQuantity: 30,
        imageUrl: getNextProductImage(),
        categoryId: thermostatCategory!.id,
        manufacturerId: manufacturers.find(m => m.name === 'Febi Bilstein')!.id,
        isVariant: false,
        productOptions: { create: [{ name: 'Температура спрацювання', value: '83°C' }, { name: 'Комплектація', value: 'Без корпусу' }] }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Генератор Bosch 0124525037',
        description: 'Генератор змінного струму потужністю 140А для сучасних автомобілів.',
        price: 8500.00,
        stockQuantity: 5,
        imageUrl: getNextProductImage(),
        categoryId: generatorCategory!.id,
        manufacturerId: manufacturers.find(m => m.name === 'Bosch')!.id,
        isVariant: false,
        productOptions: { create: [{ name: 'Потужність', value: '140A' }, { name: 'Напруга', value: '14V' }, { name: 'Тип кріплення', value: 'PAD' }] }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Щітки генератора Bosch 1007014106',
        description: 'Комплект вугільних щіток для генераторів Bosch.',
        price: 350.00,
        stockQuantity: 60,
        imageUrl: getNextProductImage(),
        categoryId: generatorCategory!.id,
        manufacturerId: manufacturers.find(m => m.name === 'Bosch')!.id,
        isVariant: false,
        productOptions: { create: [{ name: 'Комплектність', value: '2 щітки + пружини' }, { name: 'Матеріал', value: 'Вугілля-графіт' }] }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Комплект зчеплення Sachs 3000 951 301',
        description: 'Повний комплект зчеплення: диск, кошик, підшипник вижимний.',
        price: 4200.00,
        stockQuantity: 12,
        imageUrl: getNextProductImage(),
        categoryId: clutchCategory!.id,
        manufacturerId: manufacturers.find(m => m.name === 'Sachs')!.id,
        isVariant: false,
        productOptions: { create: [{ name: 'Діаметр диска', value: '215 мм' }, { name: 'Комплектність', value: 'Диск + кошик + підшипник' }] }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Комплект зчеплення LuK 621 3037 00',
        description: 'Німецький комплект зчеплення LuK для європейських автомобілів.',
        price: 3850.00,
        stockQuantity: 10,
        imageUrl: getNextProductImage(),
        categoryId: clutchCategory!.id,
        manufacturerId: manufacturers.find(m => m.name === 'Continental')!.id,
        isVariant: false,
        productOptions: { create: [{ name: 'Діаметр диска', value: '200 мм' }, { name: 'Кількість шліців', value: '20' }] }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Салонний фільтр Mann CU 2545',
        description: 'Вугільний салонний фільтр для очищення повітря в салоні.',
        price: 520.00,
        stockQuantity: 45,
        imageUrl: getNextProductImage(),
        categoryId: filterCategory!.id,
        manufacturerId: manufacturers.find(m => m.name === 'Mann Filter')!.id,
        isVariant: false,
        productOptions: { create: [{ name: 'Тип', value: 'Активований вугілля' }, { name: 'Розмір', value: '216x194x30 мм' }] }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Салонний фільтр Bosch 1987432120',
        description: 'Антибактеріальний салонний фільтр з активованим вугіллям.',
        price: 650.00,
        stockQuantity: 35,
        imageUrl: getNextProductImage(),
        categoryId: filterCategory!.id,
        manufacturerId: manufacturers.find(m => m.name === 'Bosch')!.id,
        isVariant: false,
        productOptions: { create: [{ name: 'Тип', value: 'Антибактеріальний' }, { name: 'Фільтрація', value: '99% пилку та бактерій' }] }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Свічка розжарювання Bosch 0250403009',
        description: 'Свічка розжарювання для дизельних двигунів з керамічним нагрівальним елементом.',
        price: 850.00,
        stockQuantity: 24,
        imageUrl: getNextProductImage(),
        categoryId: sparkPlugsCategory!.id,
        manufacturerId: manufacturers.find(m => m.name === 'Bosch')!.id,
        isVariant: false,
        productOptions: { create: [{ name: 'Тип', value: 'Керамічна' }, { name: 'Час нагріву', value: '2 секунди' }, { name: 'Різьба', value: 'M10x1.0' }] }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Свічка розжарювання NGK Y-534J',
        description: 'Металева свічка розжарювання для важких умов експлуатації.',
        price: 680.00,
        stockQuantity: 30,
        imageUrl: getNextProductImage(),
        categoryId: sparkPlugsCategory!.id,
        manufacturerId: manufacturers.find(m => m.name === 'NGK')!.id,
        isVariant: false,
        productOptions: { create: [{ name: 'Тип', value: 'Металева' }, { name: 'Час нагріву', value: '4 секунди' }, { name: 'Різьба', value: 'M10x1.25' }] }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Лампа H1 Osram Night Breaker Laser +150%',
        description: 'Потужна галогенна лампа H1 з підвищеною яскравістю до 150%.',
        price: 420.00,
        stockQuantity: 40,
        imageUrl: getNextProductImage(),
        categoryId: lampsCategory!.id,
        manufacturerId: manufacturers.find(m => m.name === 'Hella')!.id,
        isVariant: false,
        productOptions: { create: [{ name: 'Цоколь', value: 'H1' }, { name: 'Потужність', value: '55W' }, { name: 'Яскравість', value: '+150%' }] }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Лампа W5W Philips X-tremeVision',
        description: 'Сигнальна лампа W5W для габаритних вогнів та покажчиків повороту.',
        price: 85.00,
        stockQuantity: 100,
        imageUrl: getNextProductImage(),
        categoryId: lampsCategory!.id,
        manufacturerId: manufacturers.find(m => m.name === 'Hella')!.id,
        isVariant: false,
        productOptions: { create: [{ name: 'Цоколь', value: 'W5W' }, { name: 'Потужність', value: '5W' }, { name: 'Тип', value: 'Галогенна' }] }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Моторна олива Total Quartz 9000 5W-30',
        description: 'Повністю синтетична моторна олива для бензинових та дизельних двигунів.',
        price: 1950.00,
        stockQuantity: 25,
        imageUrl: getNextProductImage(),
        categoryId: oilCategory!.id,
        manufacturerId: manufacturers.find(m => m.name === 'Shell')!.id,
        isVariant: false,
        productOptions: { create: [{ name: "В'язкість", value: '5W-30' }, { name: 'Тип', value: 'Повністю синтетична' }, { name: "Об'єм", value: '5 літрів' }] }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Моторна олива Liqui Moly Top Tec 4100 5W-40',
        description: 'Німецька синтетична олива преміум класу для високонавантажених двигунів.',
        price: 2200.00,
        stockQuantity: 20,
        imageUrl: getNextProductImage(),
        categoryId: oilCategory!.id,
        manufacturerId: manufacturers.find(m => m.name === 'Mobil 1')!.id,
        isVariant: false,
        productOptions: { create: [{ name: "В'язкість", value: '5W-40' }, { name: 'Тип', value: 'Повністю синтетична' }, { name: "Об'єм", value: '5 літрів' }] }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Гальмівна рідина Bosch DOT 4',
        description: 'Синтетична гальмівна рідина з високою температурою кипіння.',
        price: 320.00,
        stockQuantity: 50,
        imageUrl: getNextProductImage(),
        categoryId: oilCategory!.id,
        manufacturerId: manufacturers.find(m => m.name === 'Bosch')!.id,
        isVariant: false,
        productOptions: { create: [{ name: 'Специфікація', value: 'DOT 4' }, { name: 'Температура кипіння', value: '230°C' }, { name: "Об'єм", value: '1 літр' }] }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Антифриз Castrol Radicool SF',
        description: 'Концентрат антифризу на основі етиленгліколю для всіх типів двигунів.',
        price: 480.00,
        stockQuantity: 35,
        imageUrl: getNextProductImage(),
        categoryId: oilCategory!.id,
        manufacturerId: manufacturers.find(m => m.name === 'Castrol')!.id,
        isVariant: false,
        productOptions: { create: [{ name: 'Тип', value: 'Концентрат G12++' }, { name: 'Колір', value: 'Фіолетовий' }, { name: "Об'єм", value: '5 літрів' }] }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Акумулятор Tudor Exide AGM',
        description: 'AGM акумулятор для автомобілів з системою Start-Stop.',
        price: 4500.00,
        stockQuantity: 8,
        imageUrl: getNextProductImage(),
        categoryId: batteryCategory!.id,
        manufacturerId: manufacturers.find(m => m.name === 'Varta')!.id,
        isVariant: false,
        productOptions: { create: [{ name: 'Ємність', value: '80 Ah' }, { name: 'Технологія', value: 'AGM' }, { name: 'Start-Stop', value: 'Так' }] }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Амортизатор Bilstein B4 22-112684',
        description: 'Газовий амортизатор німецької якості для комфортної їзди.',
        price: 2200.00,
        stockQuantity: 15,
        imageUrl: getNextProductImage(),
        categoryId: shockAbsorberCategory!.id,
        manufacturerId: manufacturers.find(m => m.name === 'Monroe')!.id,
        isVariant: false,
        productOptions: { create: [{ name: 'Тип', value: 'Газовий однотрубний' }, { name: 'Серія', value: 'B4 OE Replacement' }] }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Стійка стабілізатора Lemförder 37346 01',
        description: 'Стійка стабілізатора поперечної стійкості з поліуретановими втулками.',
        price: 380.00,
        stockQuantity: 60,
        imageUrl: getNextProductImage(),
        categoryId: shockAbsorberCategory!.id,
        manufacturerId: manufacturers.find(m => m.name === 'Lemförder')!.id,
        isVariant: false,
        productOptions: { create: [{ name: 'Положення', value: 'Передня вісь' }, { name: 'Матеріал втулок', value: 'Поліуретан' }] }
      }
    })
  ])

  console.log('🌱 Створення сумісності товарів з автомобілями...')

  const allCarYears = await prisma.carYear.findMany({
    include: {
      model: { include: { make: true } },
      bodyTypes: { include: { engines: true } }
    }
  })

  const compatibilities = []

  const productAirFilterBosch = products.find(p => p.name === 'Повітряний фільтр Bosch S0123')
  const carToyotaCamry2018_20L = allCarYears.find(cy =>
    cy.model.make.name === 'Toyota' &&
    cy.model.name === 'Camry' &&
    cy.year === 2018 &&
    cy.bodyTypes.some(bt => bt.name === 'Седан' && bt.engines.some(e => e.name === '2.0L I4'))
  )
  if (productAirFilterBosch && carToyotaCamry2018_20L) {
    const bodyType = carToyotaCamry2018_20L.bodyTypes.find(bt => bt.name === 'Седан')!
    const engine = bodyType.engines.find(e => e.name === '2.0L I4')!
    compatibilities.push(
      prisma.compatibility.create({
        data: {
          productId: productAirFilterBosch.id,
          carMakeId: carToyotaCamry2018_20L.model.make.id,
          carModelId: carToyotaCamry2018_20L.model.id,
          carYearId: carToyotaCamry2018_20L.id,
          carBodyTypeId: bodyType.id,
          carEngineId: engine.id
        }
      })
    )
  }

  const productBrakesBrembo = products.find(p => p.name === 'Гальмівні колодки Brembo P 83 140')
  const carBmwX5_2019_30Turbo = allCarYears.find(cy =>
    cy.model.make.name === 'BMW' &&
    cy.model.name === 'X5' &&
    cy.year === 2019 &&
    cy.bodyTypes.some(bt => bt.name === 'SUV' && bt.engines.some(e => e.name === '3.0L I6 Turbo'))
  )
  if (productBrakesBrembo && carBmwX5_2019_30Turbo) {
    const bodyType = carBmwX5_2019_30Turbo.bodyTypes.find(bt => bt.name === 'SUV')!
    const engine = bodyType.engines.find(e => e.name === '3.0L I6 Turbo')!
    compatibilities.push(
      prisma.compatibility.create({
        data: {
          productId: productBrakesBrembo.id,
          carMakeId: carBmwX5_2019_30Turbo.model.make.id,
          carModelId: carBmwX5_2019_30Turbo.model.id,
          carYearId: carBmwX5_2019_30Turbo.id,
          carBodyTypeId: bodyType.id,
          carEngineId: engine.id
        }
      })
    )
  }

  const productOilShell = products.find(p => p.name === 'Моторна олива Shell Helix Ultra 5W-40')
  const carVWGolf2018_14TSI = allCarYears.find(cy =>
    cy.model.make.name === 'Volkswagen' &&
    cy.model.name === 'Golf' &&
    cy.year === 2018 &&
    cy.bodyTypes.some(bt => bt.name === 'Хетчбек' && bt.engines.some(e => e.name === '1.4L TSI'))
  )
  if (productOilShell && carVWGolf2018_14TSI) {
    const bodyType = carVWGolf2018_14TSI.bodyTypes.find(bt => bt.name === 'Хетчбек')!
    const engine = bodyType.engines.find(e => e.name === '1.4L TSI')!
    compatibilities.push(
      prisma.compatibility.create({
        data: {
          productId: productOilShell.id,
          carMakeId: carVWGolf2018_14TSI.model.make.id,
          carModelId: carVWGolf2018_14TSI.model.id,
          carYearId: carVWGolf2018_14TSI.id,
          carBodyTypeId: bodyType.id,
          carEngineId: engine.id
        }
      })
    )
  }

  const productSparkPlugNGK = products.find(p => p.name === 'Свічка запалювання NGK BKR6E-11');
  const carFordFocus2018_10EcoBoost = allCarYears.find(cy =>
    cy.model.make.name === 'Ford' &&
    cy.model.name === 'Focus' &&
    cy.year === 2018 &&
    cy.bodyTypes.some(bt => bt.name === 'Хетчбек' && bt.engines.some(e => e.name === '1.0L EcoBoost'))
  );
  if (productSparkPlugNGK && carFordFocus2018_10EcoBoost) {
    const bodyType = carFordFocus2018_10EcoBoost.bodyTypes.find(bt => bt.name === 'Хетчбек')!;
    const engine = bodyType.engines.find(e => e.name === '1.0L EcoBoost')!;
    compatibilities.push(
      prisma.compatibility.create({
        data: {
          productId: productSparkPlugNGK.id,
          carMakeId: carFordFocus2018_10EcoBoost.model.make.id,
          carModelId: carFordFocus2018_10EcoBoost.model.id,
          carYearId: carFordFocus2018_10EcoBoost.id,
          carBodyTypeId: bodyType.id,
          carEngineId: engine.id,
        },
      })
    );
  }

  const productBatteryVarta = products.find(p => p.name === 'Акумулятор Varta Blue Dynamic E11');
  const carSkodaOctavia2020_20TDI = allCarYears.find(cy =>
    cy.model.make.name === 'Skoda' &&
    cy.model.name === 'Octavia' &&
    cy.year === 2020 &&
    cy.bodyTypes.some(bt => bt.name === 'Універсал (Combi)' && bt.engines.some(e => e.name === '2.0L TDI Evo'))
  );
  if (productBatteryVarta && carSkodaOctavia2020_20TDI) {
    const bodyType = carSkodaOctavia2020_20TDI.bodyTypes.find(bt => bt.name === 'Універсал (Combi)')!;
    const engine = bodyType.engines.find(e => e.name === '2.0L TDI Evo')!;
    compatibilities.push(
      prisma.compatibility.create({
        data: {
          productId: productBatteryVarta.id,
          carMakeId: carSkodaOctavia2020_20TDI.model.make.id,
          carModelId: carSkodaOctavia2020_20TDI.model.id,
          carYearId: carSkodaOctavia2020_20TDI.id,
          carBodyTypeId: bodyType.id,
          carEngineId: engine.id,
        },
      }));
  }

  const productBrakeDiscBrembo = products.find(p => p.name === 'Гальмівний диск Brembo 09.5844.11');
  const carBmw3Series2019 = allCarYears.find(cy =>
    cy.model.make.name === 'BMW' &&
    cy.model.name === '3 Series' &&
    cy.year === 2019 &&
    cy.bodyTypes.some(bt => bt.name === 'Седан' && bt.engines.some(e => e.name === '2.0L I4 Turbo'))
  );
  if (productBrakeDiscBrembo && carBmw3Series2019) {
    const bodyType = carBmw3Series2019.bodyTypes.find(bt => bt.name === 'Седан')!;
    const engine = bodyType.engines.find(e => e.name === '2.0L I4 Turbo')!;
    compatibilities.push(
      prisma.compatibility.create({
        data: {
          productId: productBrakeDiscBrembo.id,
          carMakeId: carBmw3Series2019.model.make.id,
          carModelId: carBmw3Series2019.model.id,
          carYearId: carBmw3Series2019.id,
          carBodyTypeId: bodyType.id,
          carEngineId: engine.id,
        },
      })
    );
  }

  const productWaterPumpGates = products.find(p => p.name === 'Водяна помпа Gates WP0031');
  const carHondaCivic2018 = allCarYears.find(cy =>
    cy.model.make.name === 'Honda' &&
    cy.model.name === 'Civic' &&
    cy.year === 2018 &&
    cy.bodyTypes.some(bt => bt.name === 'Седан' && bt.engines.some(e => e.name === '1.5L VTEC Turbo'))
  );
  if (productWaterPumpGates && carHondaCivic2018) {
    const bodyType = carHondaCivic2018.bodyTypes.find(bt => bt.name === 'Седан')!;
    const engine = bodyType.engines.find(e => e.name === '1.5L VTEC Turbo')!;
    compatibilities.push(
      prisma.compatibility.create({
        data: {
          productId: productWaterPumpGates.id,
          carMakeId: carHondaCivic2018.model.make.id,
          carModelId: carHondaCivic2018.model.id,
          carYearId: carHondaCivic2018.id,
          carBodyTypeId: bodyType.id,
          carEngineId: engine.id,
        },
      })
    );
  }

  const productThermostatGates = products.find(p => p.name === 'Термостат Gates TH33882G1');
  const carHyundaiTucson2019 = allCarYears.find(cy =>
    cy.model.make.name === 'Hyundai' &&
    cy.model.name === 'Tucson' &&
    cy.year === 2019 &&
    cy.bodyTypes.some(bt => bt.name === 'SUV' && bt.engines.some(e => e.name === '1.6L T-GDI'))
  );
  if (productThermostatGates && carHyundaiTucson2019) {
    const bodyType = carHyundaiTucson2019.bodyTypes.find(bt => bt.name === 'SUV')!;
    const engine = bodyType.engines.find(e => e.name === '1.6L T-GDI')!;
    compatibilities.push(
      prisma.compatibility.create({
        data: {
          productId: productThermostatGates.id,
          carMakeId: carHyundaiTucson2019.model.make.id,
          carModelId: carHyundaiTucson2019.model.id,
          carYearId: carHyundaiTucson2019.id,
          carBodyTypeId: bodyType.id,
          carEngineId: engine.id,
        },
      })
    );
  }

  const productClutchSachs = products.find(p => p.name === 'Комплект зчеплення Sachs 3000 951 301');
  const carKiaCeed2018 = allCarYears.find(cy =>
    cy.model.make.name === 'Kia' &&
    cy.model.name === 'Ceed' &&
    cy.year === 2018 &&
    cy.bodyTypes.some(bt => bt.name === 'Хетчбек' && bt.engines.some(e => e.name === '1.0L T-GDI'))
  );
  if (productClutchSachs && carKiaCeed2018) {
    const bodyType = carKiaCeed2018.bodyTypes.find(bt => bt.name === 'Хетчбек')!;
    const engine = bodyType.engines.find(e => e.name === '1.0L T-GDI')!;
    compatibilities.push(
      prisma.compatibility.create({
        data: {
          productId: productClutchSachs.id,
          carMakeId: carKiaCeed2018.model.make.id,
          carModelId: carKiaCeed2018.model.id,
          carYearId: carKiaCeed2018.id,
          carBodyTypeId: bodyType.id,
          carEngineId: engine.id,
        },
      })
    );
  }

  const productGeneratorBosch = products.find(p => p.name === 'Генератор Bosch 0124525037');
  const carNissanQashqai2018 = allCarYears.find(cy =>
    cy.model.make.name === 'Nissan' &&
    cy.model.name === 'Qashqai' &&
    cy.year === 2018 &&
    cy.bodyTypes.some(bt => bt.name === 'SUV' && bt.engines.some(e => e.name === '1.2L DIG-T'))
  );
  if (productGeneratorBosch && carNissanQashqai2018) {
    const bodyType = carNissanQashqai2018.bodyTypes.find(bt => bt.name === 'SUV')!;
    const engine = bodyType.engines.find(e => e.name === '1.2L DIG-T')!;
    compatibilities.push(
      prisma.compatibility.create({
        data: {
          productId: productGeneratorBosch.id,
          carMakeId: carNissanQashqai2018.model.make.id,
          carModelId: carNissanQashqai2018.model.id,
          carYearId: carNissanQashqai2018.id,
          carBodyTypeId: bodyType.id,
          carEngineId: engine.id,
        },
      })
    );
  }

  const productGlowPlugBosch = products.find(p => p.name === 'Свічка розжарювання Bosch 0250403009');
  const carPeugeot3082018 = allCarYears.find(cy =>
    cy.model.make.name === 'Peugeot' &&
    cy.model.name === '308' &&
    cy.year === 2018 &&
    cy.bodyTypes.some(bt => bt.name === 'Хетчбек' && bt.engines.some(e => e.name === '1.5L BlueHDi'))
  );
  if (productGlowPlugBosch && carPeugeot3082018) {
    const bodyType = carPeugeot3082018.bodyTypes.find(bt => bt.name === 'Хетчбек')!;
    const engine = bodyType.engines.find(e => e.name === '1.5L BlueHDi')!;
    compatibilities.push(
      prisma.compatibility.create({
        data: {
          productId: productGlowPlugBosch.id,
          carMakeId: carPeugeot3082018.model.make.id,
          carModelId: carPeugeot3082018.model.id,
          carYearId: carPeugeot3082018.id,
          carBodyTypeId: bodyType.id,
          carEngineId: engine.id,
        },
      })
    );
  }

  const productCabinFilterMann = products.find(p => p.name === 'Салонний фільтр Mann CU 2545');
  const carRenaultClio2018 = allCarYears.find(cy =>
    cy.model.make.name === 'Renault' &&
    cy.model.name === 'Clio' &&
    cy.year === 2018 &&
    cy.bodyTypes.some(bt => bt.name === 'Хетчбек' && bt.engines.some(e => e.name === '0.9L TCe'))
  );
  if (productCabinFilterMann && carRenaultClio2018) {
    const bodyType = carRenaultClio2018.bodyTypes.find(bt => bt.name === 'Хетчбек')!;
    const engine = bodyType.engines.find(e => e.name === '0.9L TCe')!;
    compatibilities.push(
      prisma.compatibility.create({
        data: {
          productId: productCabinFilterMann.id,
          carMakeId: carRenaultClio2018.model.make.id,
          carModelId: carRenaultClio2018.model.id,
          carYearId: carRenaultClio2018.id,
          carBodyTypeId: bodyType.id,
          carEngineId: engine.id,
        },
      })
    );
  }

  const productOilTotal = products.find(p => p.name === 'Моторна олива Total Quartz 9000 5W-30');
  const carOpelAstra2018 = allCarYears.find(cy =>
    cy.model.make.name === 'Opel' &&
    cy.model.name === 'Astra' &&
    cy.year === 2018 &&
    cy.bodyTypes.some(bt => bt.name === 'Хетчбек' && bt.engines.some(e => e.name === '1.0L Turbo'))
  );
  if (productOilTotal && carOpelAstra2018) {
    const bodyType = carOpelAstra2018.bodyTypes.find(bt => bt.name === 'Хетчбек')!;
    const engine = bodyType.engines.find(e => e.name === '1.0L Turbo')!;
    compatibilities.push(
      prisma.compatibility.create({
        data: {
          productId: productOilTotal.id,
          carMakeId: carOpelAstra2018.model.make.id,
          carModelId: carOpelAstra2018.model.id,
          carYearId: carOpelAstra2018.id,
          carBodyTypeId: bodyType.id,
          carEngineId: engine.id,
        },
      })
    );
  }

  await Promise.all(compatibilities)

  const totalProducts = await prisma.product.count({ where: { isVariant: false } });
  const totalVariants = await prisma.product.count({ where: { isVariant: true } });
  const totalCategories = await prisma.category.count({ where: { parentId: null } });
  const totalSubCategories = await prisma.category.count({ where: { parentId: { not: null } } });
  const totalManufacturers = await prisma.manufacturer.count();
  const totalCarMakes = await prisma.carMake.count();
  const totalCarModels = await prisma.carModel.count();
  const totalCompatibilities = await prisma.compatibility.count();


  console.log('✅ Seeding завершено успішно!')
  console.log(`📊 Створено:
  - ${totalCategories} основних категорій та ${totalSubCategories} підкатегорій
  - ${totalManufacturers} виробників
  - ${totalCarMakes} марок автомобілів
  - ${totalCarModels} моделей автомобілів
  - ${totalProducts} основних товарів та ${totalVariants} варіантів товарів
  - ${totalCompatibilities} зв'язків сумісності`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })