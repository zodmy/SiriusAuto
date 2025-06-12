import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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

  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Запчастини двигуна',
        children: {
          create: [
            { name: 'Фільтри' },
            { name: 'Свічки запалювання' },
            { name: 'Ремені' },
            { name: 'Масла та рідини' },
            { name: 'Прокладки' },
            { name: 'Поршні та циліндри' }
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
            { name: 'Суппорти' }
          ]
        }
      }
    }),
    prisma.category.create({
      data: {
        name: 'Підвіска',
        children: {
          create: [
            { name: 'Амортизатори' },
            { name: 'Пружини' },
            { name: 'Втулки' },
            { name: 'Стабілізатори' },
            { name: 'Сайлентблоки' }
          ]
        }
      }
    }),
    prisma.category.create({
      data: {
        name: 'Електрика',
        children: {
          create: [
            { name: 'Акумулятори' },
            { name: 'Генератори' },
            { name: 'Стартери' },
            { name: 'Лампи' },
            { name: 'Запобіжники' }
          ]
        }
      }
    }),
    prisma.category.create({
      data: {
        name: 'Кузов',
        children: {
          create: [
            { name: 'Фари' },
            { name: 'Дзеркала' },
            { name: 'Бампери' },
            { name: 'Решітки радіатора' },
            { name: 'Молдинги' }
          ]
        }
      }
    }),
    prisma.category.create({
      data: {
        name: 'Трансмісія',
        children: {
          create: [
            { name: 'Зчеплення' },
            { name: 'Коробка передач' },
            { name: 'Карданні вали' },
            { name: 'Диференціали' }
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
    prisma.manufacturer.create({ data: { name: 'Continental' } })
  ])

  console.log('🌱 Створення марок автомобілів...')

  const carMakes = await Promise.all([
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
                    bodyTypes: {
                      create: [
                        {
                          name: 'Седан',
                          engines: {
                            create: [
                              { name: '2.0L I4' },
                              { name: '2.5L I4 Hybrid' },
                              { name: '3.5L V6' }
                            ]
                          }
                        }
                      ]
                    }
                  },
                  {
                    year: 2019,
                    bodyTypes: {
                      create: [
                        {
                          name: 'Седан',
                          engines: {
                            create: [
                              { name: '2.0L I4' },
                              { name: '2.5L I4 Hybrid' },
                              { name: '3.5L V6' }
                            ]
                          }
                        }
                      ]
                    }
                  },
                  {
                    year: 2020,
                    bodyTypes: {
                      create: [
                        {
                          name: 'Седан',
                          engines: {
                            create: [
                              { name: '2.0L I4' },
                              { name: '2.5L I4 Hybrid' },
                              { name: '3.5L V6' }
                            ]
                          }
                        }
                      ]
                    }
                  }
                ]
              }
            },
            {
              name: 'RAV4',
              years: {
                create: [
                  {
                    year: 2019,
                    bodyTypes: {
                      create: [
                        {
                          name: 'SUV',
                          engines: {
                            create: [
                              { name: '2.0L I4' },
                              { name: '2.5L I4 Hybrid' }
                            ]
                          }
                        }
                      ]
                    }
                  },
                  {
                    year: 2020,
                    bodyTypes: {
                      create: [
                        {
                          name: 'SUV',
                          engines: {
                            create: [
                              { name: '2.0L I4' },
                              { name: '2.5L I4 Hybrid' }
                            ]
                          }
                        }
                      ]
                    }
                  }
                ]
              }
            },
            {
              name: 'Corolla',
              years: {
                create: [
                  {
                    year: 2019,
                    bodyTypes: {
                      create: [
                        {
                          name: 'Седан',
                          engines: {
                            create: [
                              { name: '1.8L I4' },
                              { name: '1.8L I4 Hybrid' }
                            ]
                          }
                        }
                      ]
                    }
                  }
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
                  {
                    year: 2018,
                    bodyTypes: {
                      create: [
                        {
                          name: 'SUV',
                          engines: {
                            create: [
                              { name: '3.0L I6 Turbo' },
                              { name: '4.4L V8 Turbo' }
                            ]
                          }
                        }
                      ]
                    }
                  },
                  {
                    year: 2019,
                    bodyTypes: {
                      create: [
                        {
                          name: 'SUV',
                          engines: {
                            create: [
                              { name: '3.0L I6 Turbo' },
                              { name: '4.4L V8 Turbo' }
                            ]
                          }
                        }
                      ]
                    }
                  }
                ]
              }
            },
            {
              name: '3 Series',
              years: {
                create: [
                  {
                    year: 2019,
                    bodyTypes: {
                      create: [
                        {
                          name: 'Седан',
                          engines: {
                            create: [
                              { name: '2.0L I4 Turbo' },
                              { name: '3.0L I6 Turbo' }
                            ]
                          }
                        }
                      ]
                    }
                  },
                  {
                    year: 2020,
                    bodyTypes: {
                      create: [
                        {
                          name: 'Седан',
                          engines: {
                            create: [
                              { name: '2.0L I4 Turbo' },
                              { name: '3.0L I6 Turbo' }
                            ]
                          }
                        }
                      ]
                    }
                  }
                ]
              }
            },
            {
              name: 'X3',
              years: {
                create: [
                  {
                    year: 2019,
                    bodyTypes: {
                      create: [
                        {
                          name: 'SUV',
                          engines: {
                            create: [
                              { name: '2.0L I4 Turbo' },
                              { name: '3.0L I6 Turbo' }
                            ]
                          }
                        }
                      ]
                    }
                  }
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
                  {
                    year: 2018,
                    bodyTypes: {
                      create: [
                        {
                          name: 'Хетчбек',
                          engines: {
                            create: [
                              { name: '1.4L TSI' },
                              { name: '2.0L TSI' }
                            ]
                          }
                        }
                      ]
                    }
                  },
                  {
                    year: 2019,
                    bodyTypes: {
                      create: [
                        {
                          name: 'Хетчбек',
                          engines: {
                            create: [
                              { name: '1.4L TSI' },
                              { name: '2.0L TSI' }
                            ]
                          }
                        }
                      ]
                    }
                  }
                ]
              }
            },
            {
              name: 'Passat',
              years: {
                create: [
                  {
                    year: 2018,
                    bodyTypes: {
                      create: [
                        {
                          name: 'Седан',
                          engines: {
                            create: [
                              { name: '1.8L TSI' },
                              { name: '2.0L TSI' }
                            ]
                          }
                        }
                      ]
                    }
                  }
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
                  {
                    year: 2019,
                    bodyTypes: {
                      create: [
                        {
                          name: 'Седан',
                          engines: {
                            create: [
                              { name: '1.5L I4 Turbo' },
                              { name: '2.0L I4 Turbo' }
                            ]
                          }
                        }
                      ]
                    }
                  }
                ]
              }
            },
            {
              name: 'GLE',
              years: {
                create: [
                  {
                    year: 2020,
                    bodyTypes: {
                      create: [
                        {
                          name: 'SUV',
                          engines: {
                            create: [
                              { name: '2.0L I4 Turbo' },
                              { name: '3.0L V6 Turbo' }
                            ]
                          }
                        }
                      ]
                    }
                  }
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
                  {
                    year: 2018,
                    bodyTypes: {
                      create: [
                        {
                          name: 'Седан',
                          engines: {
                            create: [
                              { name: '2.0L I4 Turbo' },
                              { name: '3.0L V6 Turbo' }
                            ]
                          }
                        }
                      ]
                    }
                  }
                ]
              }
            },
            {
              name: 'Q5',
              years: {
                create: [
                  {
                    year: 2019,
                    bodyTypes: {
                      create: [
                        {
                          name: 'SUV',
                          engines: {
                            create: [
                              { name: '2.0L I4 Turbo' },
                              { name: '3.0L V6 Turbo' }
                            ]
                          }
                        }
                      ]
                    }
                  }
                ]
              }
            }
          ]
        }
      }
    })
  ])

  const filterCategory = await prisma.category.findFirst({
    where: { name: 'Фільтри' }
  })

  const sparkPlugsCategory = await prisma.category.findFirst({
    where: { name: 'Свічки запалювання' }
  })

  const brakeCategory = await prisma.category.findFirst({
    where: { name: 'Гальмівні колодки' }
  })

  const oilCategory = await prisma.category.findFirst({
    where: { name: 'Масла та рідини' }
  })

  const batteryCategory = await prisma.category.findFirst({
    where: { name: 'Акумулятори' }
  })

  const shockAbsorberCategory = await prisma.category.findFirst({
    where: { name: 'Амортизатори' }
  })

  console.log('🌱 Створення продуктів...')

  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Повітряний фільтр Bosch S0123',
        description: 'Високоякісний повітряний фільтр для більшості японських автомобілів. Забезпечує оптимальну фільтрацію повітря та захист двигуна.',
        price: 850.00,
        stockQuantity: 25,
        categoryId: filterCategory!.id,
        manufacturerId: manufacturers[0].id,
        isVariant: false,
        productOptions: {
          create: [
            { name: 'Матеріал', value: 'Паперовий' },
            { name: 'Форма', value: 'Прямокутна' },
            { name: 'Розмір', value: '280x215x58 мм' }
          ]
        }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Масляний фільтр Mann W 712/75',
        description: 'Оригінальний масляний фільтр німецького виробництва. Відмінна якість фільтрації та довговічність.',
        price: 320.00,
        stockQuantity: 50,
        categoryId: filterCategory!.id,
        manufacturerId: manufacturers[1].id,
        isVariant: false,
        productOptions: {
          create: [
            { name: 'Тип', value: 'Накручувальний' },
            { name: 'Діаметр', value: '76 мм' },
            { name: 'Висота', value: '79 мм' }
          ]
        }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Паливний фільтр Bosch F 026 402 067',
        description: 'Надійний паливний фільтр для очищення палива від забруднень та води.',
        price: 450.00,
        stockQuantity: 30,
        categoryId: filterCategory!.id,
        manufacturerId: manufacturers[0].id,
        isVariant: false,
        productOptions: {
          create: [
            { name: 'Тип', value: 'Лінійний' },
            { name: 'Підключення', value: 'Push-in' }
          ]
        }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Свічка запалювання NGK BKR6E-11',
        description: 'Стандартна свічка запалювання з нікелевим електродом. Забезпечує стабільне запалювання.',
        price: 180.00,
        stockQuantity: 100,
        categoryId: sparkPlugsCategory!.id,
        manufacturerId: manufacturers[2].id,
        isVariant: false,
        productOptions: {
          create: [
            { name: 'Зазор', value: '1.1 мм' },
            { name: 'Різьба', value: 'M14x1.25' },
            { name: 'Довжина різьби', value: '19 мм' }
          ]
        }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Свічка запалювання Denso IK20TT',
        description: 'Іридієва свічка запалювання преміум класу для підвищеної продуктивності.',
        price: 380.00,
        stockQuantity: 60,
        categoryId: sparkPlugsCategory!.id,
        manufacturerId: manufacturers[12].id,
        isVariant: false,
        productOptions: {
          create: [
            { name: 'Матеріал електрода', value: 'Іридій' },
            { name: 'Зазор', value: '0.8 мм' },
            { name: 'Різьба', value: 'M14x1.25' }
          ]
        }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Гальмівні колодки Brembo P 83 140',
        description: 'Передні гальмівні колодки для європейських автомобілів. Відмінне гальмування та довговічність.',
        price: 2800.00,
        stockQuantity: 15,
        categoryId: brakeCategory!.id,
        manufacturerId: manufacturers[5].id,
        isVariant: false,
        productOptions: {
          create: [
            { name: 'Положення', value: 'Передня вісь' },
            { name: 'Товщина', value: '17.5 мм' },
            { name: 'Ширина', value: '131.4 мм' }
          ]
        }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Гальмівні колодки Bosch 0 986 494 293',
        description: 'Задні гальмівні колодки для легкових автомобілів з керамічним покриттям.',
        price: 1850.00,
        stockQuantity: 20,
        categoryId: brakeCategory!.id,
        manufacturerId: manufacturers[0].id,
        isVariant: false,
        productOptions: {
          create: [
            { name: 'Положення', value: 'Задня вісь' },
            { name: 'Товщина', value: '16.8 мм' },
            { name: 'Тип', value: 'Керамічні' }
          ]
        }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Моторна олива Castrol GTX 5W-30',
        description: 'Напівсинтетична моторна олива для бензинових двигунів. Забезпечує надійний захист двигуна.',
        price: 1600.00,
        stockQuantity: 40,
        categoryId: oilCategory!.id,
        manufacturerId: manufacturers[4].id,
        isVariant: false,
        variants: {
          create: [
            {
              name: 'Моторна олива Castrol GTX 5W-30 (1L)',
              description: 'Напівсинтетична моторна олива для бензинових двигунів - 1 літр',
              price: 350.00,
              stockQuantity: 80,
              categoryId: oilCategory!.id,
              manufacturerId: manufacturers[4].id,
              isVariant: true,
              productOptions: {
                create: [
                  { name: "Об'єм", value: '1 літр' }
                ]
              }
            },
            {
              name: 'Моторна олива Castrol GTX 5W-30 (5L)',
              description: 'Напівсинтетична моторна олива для бензинових двигунів - 5 літрів',
              price: 1600.00,
              stockQuantity: 40,
              categoryId: oilCategory!.id,
              manufacturerId: manufacturers[4].id,
              isVariant: true,
              productOptions: {
                create: [
                  { name: "Об'єм", value: '5 літрів' }
                ]
              }
            }
          ]
        },
        productOptions: {
          create: [
            { name: "В'язкість", value: '5W-30' },
            { name: 'Тип', value: 'Напівсинтетична' },
            { name: 'Специфікація', value: 'API SN/CF' }
          ]
        }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Моторна олива Mobil 1 ESP 0W-30',
        description: 'Повністю синтетична моторна олива преміум класу для сучасних двигунів.',
        price: 2200.00,
        stockQuantity: 25,
        categoryId: oilCategory!.id,
        manufacturerId: manufacturers[10].id,
        isVariant: false,
        productOptions: {
          create: [
            { name: "В'язкість", value: '0W-30' },
            { name: 'Тип', value: 'Повністю синтетична' },
            { name: "Об'єм", value: '4 літри' }
          ]
        }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Акумулятор Varta Blue Dynamic E11',
        description: 'Надійний автомобільний акумулятор з високою пусковою потужністю.',
        price: 3200.00,
        stockQuantity: 12,
        categoryId: batteryCategory!.id,
        manufacturerId: manufacturers[8].id,
        isVariant: false,
        productOptions: {
          create: [
            { name: 'Ємність', value: '74 Ah' },
            { name: 'Пусковий струм', value: '680 A' },
            { name: 'Полярність', value: 'Пряма' }
          ]
        }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Амортизатор Monroe G7423',
        description: 'Передній амортизатор газовий для комфортної їзди та стабільності.',
        price: 1850.00,
        stockQuantity: 18,
        categoryId: shockAbsorberCategory!.id,
        manufacturerId: manufacturers[7].id,
        isVariant: false,
        productOptions: {
          create: [
            { name: 'Тип', value: 'Газовий' },
            { name: 'Положення', value: 'Передня вісь' },
            { name: 'Спосіб кріплення', value: 'Знизу болт' }
          ]
        }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Амортизатор Sachs 314 855',
        description: 'Задній амортизатор масляний для європейських автомобілів.',
        price: 1650.00,
        stockQuantity: 22,
        categoryId: shockAbsorberCategory!.id,
        manufacturerId: manufacturers[6].id,
        isVariant: false,
        productOptions: {
          create: [
            { name: 'Тип', value: 'Масляний' },
            { name: 'Положення', value: 'Задня вісь' },
            { name: 'Спосіб кріплення', value: 'Знизу вухо' }
          ]
        }
      }
    })
  ])

  console.log('🌱 Створення сумісності продуктів з автомобілями...')

  const toyotaCamry2018 = await prisma.carYear.findFirst({
    where: {
      year: 2018,
      model: {
        name: 'Camry',
        make: { name: 'Toyota' }
      }
    },
    include: {
      model: { include: { make: true } },
      bodyTypes: { include: { engines: true } }
    }
  })

  const toyotaRav42019 = await prisma.carYear.findFirst({
    where: {
      year: 2019,
      model: {
        name: 'RAV4',
        make: { name: 'Toyota' }
      }
    },
    include: {
      model: { include: { make: true } },
      bodyTypes: { include: { engines: true } }
    }
  })

  const bmwX52018 = await prisma.carYear.findFirst({
    where: {
      year: 2018,
      model: {
        name: 'X5',
        make: { name: 'BMW' }
      }
    },
    include: {
      model: { include: { make: true } },
      bodyTypes: { include: { engines: true } }
    }
  })

  const bmw3Series2019 = await prisma.carYear.findFirst({
    where: {
      year: 2019,
      model: {
        name: '3 Series',
        make: { name: 'BMW' }
      }
    },
    include: {
      model: { include: { make: true } },
      bodyTypes: { include: { engines: true } }
    }
  })

  const vwGolf2018 = await prisma.carYear.findFirst({
    where: {
      year: 2018,
      model: {
        name: 'Golf',
        make: { name: 'Volkswagen' }
      }
    },
    include: {
      model: { include: { make: true } },
      bodyTypes: { include: { engines: true } }
    }
  })

  const compatibilities = []

  if (toyotaCamry2018 && products[0]) {
    const bodyType = toyotaCamry2018.bodyTypes[0]
    const engine = bodyType.engines[0]
    compatibilities.push(
      prisma.compatibility.create({
        data: {
          productId: products[0].id,
          carMakeId: toyotaCamry2018.model.make.id,
          carModelId: toyotaCamry2018.model.id,
          carYearId: toyotaCamry2018.id,
          carBodyTypeId: bodyType.id,
          carEngineId: engine.id
        }
      })
    )
  }

  if (toyotaRav42019 && products[0]) {
    const bodyType = toyotaRav42019.bodyTypes[0]
    const engine = bodyType.engines[0]
    compatibilities.push(
      prisma.compatibility.create({
        data: {
          productId: products[0].id,
          carMakeId: toyotaRav42019.model.make.id,
          carModelId: toyotaRav42019.model.id,
          carYearId: toyotaRav42019.id,
          carBodyTypeId: bodyType.id,
          carEngineId: engine.id
        }
      })
    )
  }

  if (bmwX52018 && products[5]) {
    const bodyType = bmwX52018.bodyTypes[0]
    const engine = bodyType.engines[0]
    compatibilities.push(
      prisma.compatibility.create({
        data: {
          productId: products[5].id,
          carMakeId: bmwX52018.model.make.id,
          carModelId: bmwX52018.model.id,
          carYearId: bmwX52018.id,
          carBodyTypeId: bodyType.id,
          carEngineId: engine.id
        }
      })
    )
  }

  if (bmw3Series2019 && products[3]) {
    const bodyType = bmw3Series2019.bodyTypes[0]
    const engine = bodyType.engines[0]
    compatibilities.push(
      prisma.compatibility.create({
        data: {
          productId: products[3].id,
          carMakeId: bmw3Series2019.model.make.id,
          carModelId: bmw3Series2019.model.id,
          carYearId: bmw3Series2019.id,
          carBodyTypeId: bodyType.id,
          carEngineId: engine.id
        }
      })
    )
  }

  if (vwGolf2018 && products[4]) {
    const bodyType = vwGolf2018.bodyTypes[0]
    const engine = bodyType.engines[0]
    compatibilities.push(
      prisma.compatibility.create({
        data: {
          productId: products[4].id,
          carMakeId: vwGolf2018.model.make.id,
          carModelId: vwGolf2018.model.id,
          carYearId: vwGolf2018.id,
          carBodyTypeId: bodyType.id,
          carEngineId: engine.id
        }
      })
    )
  }

  if (toyotaCamry2018 && products[7]) {
    const bodyType = toyotaCamry2018.bodyTypes[0]
    const engine = bodyType.engines[1]
    compatibilities.push(
      prisma.compatibility.create({
        data: {
          productId: products[7].id,
          carMakeId: toyotaCamry2018.model.make.id,
          carModelId: toyotaCamry2018.model.id,
          carYearId: toyotaCamry2018.id,
          carBodyTypeId: bodyType.id,
          carEngineId: engine.id
        }
      })
    )
  }

  if (bmwX52018 && products[8]) {
    const bodyType = bmwX52018.bodyTypes[0]
    const engine = bodyType.engines[1]
    compatibilities.push(
      prisma.compatibility.create({
        data: {
          productId: products[8].id,
          carMakeId: bmwX52018.model.make.id,
          carModelId: bmwX52018.model.id,
          carYearId: bmwX52018.id,
          carBodyTypeId: bodyType.id,
          carEngineId: engine.id
        }
      })
    )
  }

  await Promise.all(compatibilities)

  console.log('✅ Seeding завершено успішно!')
  console.log(`📊 Створено:
  - ${categories.length} основних категорій з підкатегоріями
  - ${manufacturers.length} виробників
  - ${carMakes.length} марок автомобілів з моделями
  - ${products.length} основних продуктів
  - ${compatibilities.length} зв'язків сумісності`)
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
